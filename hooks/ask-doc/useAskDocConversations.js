import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
    createDocConversation,
    deleteDocConversation,
    getDocConversation,
    listDocConversations,
    normalizeAskDocApiError,
    sendDocMessage,
    updateDocConversation,
} from '../../services/askDocApi';
import {
    createClientRequestId,
    getConversationId,
    getConversationMessages,
    getMessageId,
    sortConversations,
} from '../../utils/askDocFormatters';

const hasMessage = (messages, targetMessage) => {
    const targetId = getMessageId(targetMessage);
    return messages.some((message) => getMessageId(message) === targetId);
};

const upsertConversation = (conversations, conversation) => {
    const conversationId = getConversationId(conversation);
    if (!conversationId) return conversations;

    return sortConversations([
        conversation,
        ...conversations.filter((item) => getConversationId(item) !== conversationId),
    ]);
};

const appendMessages = (conversation, messages) => ({
    ...conversation,
    messages: getConversationMessages(conversation).concat(messages),
    lastMessageAt: messages[messages.length - 1]?.createdAt || conversation?.lastMessageAt,
    updatedAt: messages[messages.length - 1]?.createdAt || conversation?.updatedAt,
});

const mergeConversationUpdate = (currentConversation, updatedConversation, fallbackPatch = {}) => {
    const nextConversation = {
        ...currentConversation,
        ...fallbackPatch,
        ...updatedConversation,
    };

    if (!Array.isArray(updatedConversation?.messages) && Array.isArray(currentConversation?.messages)) {
        nextConversation.messages = currentConversation.messages;
    }

    return nextConversation;
};

const replacePendingAssistant = (conversation, pendingId, replacement) => ({
    ...conversation,
    messages: getConversationMessages(conversation).map((message) => (
        getMessageId(message) === pendingId ? replacement : message
    )),
});

const buildConversationAfterSend = ({
    fallbackConversation,
    responseConversation,
    assistantMessage,
    pendingAssistantId,
}) => {
    const baseConversation = responseConversation || fallbackConversation;
    const responseMessages = getConversationMessages(responseConversation);
    const fallbackMessages = getConversationMessages(fallbackConversation);
    const hasServerMessages = responseMessages.length > 0;
    let messages = hasServerMessages
        ? responseMessages
        : fallbackMessages.filter((message) => getMessageId(message) !== pendingAssistantId);

    if (assistantMessage && !hasMessage(messages, assistantMessage)) {
        messages = messages.concat(assistantMessage);
    }

    return {
        ...baseConversation,
        messages: getConversationMessages({ messages }),
        lastMessageAt:
            baseConversation?.lastMessageAt
            || assistantMessage?.createdAt
            || messages[messages.length - 1]?.createdAt,
        updatedAt:
            baseConversation?.updatedAt
            || assistantMessage?.createdAt
            || messages[messages.length - 1]?.createdAt,
    };
};

const useAskDocConversations = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const authChecked = useSelector((state) => state.authChecked);

    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [sendingConversationId, setSendingConversationId] = useState('');
    const [actionConversationId, setActionConversationId] = useState('');
    const [error, setError] = useState(null);

    const loadedConversationIds = useRef(new Set());
    const conversationRequestId = useRef(0);

    const applyError = useCallback((apiError) => {
        setError(normalizeAskDocApiError(apiError));
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const loadConversations = useCallback(async () => {
        if (!isLoggedIn) return;

        setLoadingList(true);
        setError(null);

        try {
            const list = await listDocConversations(
                { status: 'active', page: 1, limit: 25 },
                isLoggedIn,
            );
            const sortedList = sortConversations(list);

            setConversations(sortedList);
            setSelectedConversationId((currentId) => {
                if (currentId && sortedList.some((item) => getConversationId(item) === currentId)) {
                    return currentId;
                }

                return getConversationId(sortedList[0]) || '';
            });
        } catch (apiError) {
            setConversations([]);
            setSelectedConversationId('');
            applyError(apiError);
        } finally {
            setLoadingList(false);
        }
    }, [applyError, isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            if (authChecked) {
                setLoadingList(false);
            }
            return;
        }

        loadConversations();
    }, [authChecked, isLoggedIn, loadConversations]);

    useEffect(() => {
        if (!selectedConversationId) {
            setSelectedConversation(null);
            setLoadingConversation(false);
            return;
        }

        const localConversation = conversations.find(
            (conversation) => getConversationId(conversation) === selectedConversationId,
        );

        if (localConversation) {
            setSelectedConversation(localConversation);
        }

        if (!isLoggedIn || loadedConversationIds.current.has(selectedConversationId)) {
            return;
        }

        const requestId = conversationRequestId.current + 1;
        conversationRequestId.current = requestId;
        setLoadingConversation(true);
        setError(null);

        getDocConversation(selectedConversationId, isLoggedIn)
            .then((conversation) => {
                if (conversationRequestId.current !== requestId || !conversation) return;

                loadedConversationIds.current.add(selectedConversationId);
                setSelectedConversation(conversation);
                setConversations((current) => upsertConversation(current, conversation));
            })
            .catch((apiError) => {
                if (conversationRequestId.current !== requestId) return;
                applyError(apiError);
            })
            .finally(() => {
                if (conversationRequestId.current === requestId) {
                    setLoadingConversation(false);
                }
            });
    }, [applyError, conversations, isLoggedIn, selectedConversationId]);

    const selectConversation = useCallback((conversationId) => {
        setError(null);
        setSelectedConversationId(conversationId);
    }, []);

    const createConversation = useCallback(async () => {
        if (!isLoggedIn || creatingConversation) return null;

        setCreatingConversation(true);
        setError(null);

        try {
            const conversation = await createDocConversation(
                {
                    title: 'Ask Doc',
                    context: { sourcePage: '/ask-doc' },
                },
                isLoggedIn,
            );

            if (!conversation) return null;

            const conversationId = getConversationId(conversation);
            if (Array.isArray(conversation?.messages)) {
                loadedConversationIds.current.add(conversationId);
            }

            setConversations((current) => upsertConversation(current, conversation));
            setSelectedConversationId(conversationId);
            setSelectedConversation(conversation);
            return conversation;
        } catch (apiError) {
            applyError(apiError);
            return null;
        } finally {
            setCreatingConversation(false);
        }
    }, [applyError, creatingConversation, isLoggedIn]);

    const sendMessage = useCallback(async (rawMessage) => {
        const messageText = rawMessage.trim();
        const conversationId = selectedConversationId;

        if (!messageText || !conversationId || sendingConversationId) return false;

        const clientRequestId = createClientRequestId();
        const createdAt = new Date().toISOString();
        const userMessage = {
            _id: `local-user-${clientRequestId}`,
            role: 'user',
            content: messageText,
            status: 'sent',
            clientRequestId,
            createdAt,
            optimistic: true,
        };
        const pendingAssistant = {
            _id: `local-assistant-${clientRequestId}`,
            role: 'assistant',
            content: '',
            status: 'pending',
            clientRequestId,
            createdAt,
            pending: true,
        };
        const pendingAssistantId = getMessageId(pendingAssistant);
        const baseConversation =
            selectedConversation
            || conversations.find((item) => getConversationId(item) === conversationId)
            || { _id: conversationId, title: 'Ask Doc', messages: [] };
        const optimisticConversation = appendMessages(baseConversation, [userMessage, pendingAssistant]);

        setSendingConversationId(conversationId);
        setError(null);
        setSelectedConversation(optimisticConversation);
        setConversations((current) => upsertConversation(current, optimisticConversation));

        try {
            const result = await sendDocMessage(
                { conversationId, message: messageText, clientRequestId },
                isLoggedIn,
            );
            const nextConversation = buildConversationAfterSend({
                fallbackConversation: optimisticConversation,
                responseConversation: result.conversation,
                assistantMessage: result.assistantMessage,
                pendingAssistantId,
            });

            loadedConversationIds.current.add(conversationId);
            setSelectedConversation(nextConversation);
            setConversations((current) => upsertConversation(current, nextConversation));
            return true;
        } catch (apiError) {
            const normalizedError = normalizeAskDocApiError(apiError);
            const failedAssistant = {
                ...pendingAssistant,
                pending: false,
                status: 'failed',
                error: {
                    code: normalizedError.code,
                    message: normalizedError.message,
                },
                createdAt: new Date().toISOString(),
            };

            setError(normalizedError);
            setSelectedConversation((current) => (
                current ? replacePendingAssistant(current, pendingAssistantId, failedAssistant) : current
            ));
            setConversations((current) => current.map((conversation) => (
                getConversationId(conversation) === conversationId
                    ? replacePendingAssistant(conversation, pendingAssistantId, failedAssistant)
                    : conversation
            )));
            return false;
        } finally {
            setSendingConversationId('');
        }
    }, [
        conversations,
        isLoggedIn,
        selectedConversation,
        selectedConversationId,
        sendingConversationId,
    ]);

    const renameConversation = useCallback(async (conversationId, rawTitle) => {
        if (!conversationId || !isLoggedIn || actionConversationId) return false;

        const title = rawTitle.trim();
        if (!title || title.length > 120) return false;

        setActionConversationId(conversationId);
        setError(null);

        try {
            const updatedConversation = await updateDocConversation(
                conversationId,
                { title },
                isLoggedIn,
            );
            const fallbackConversation = { _id: conversationId, title };

            setConversations((current) => sortConversations(current.map((conversation) => (
                getConversationId(conversation) === conversationId
                    ? mergeConversationUpdate(conversation, updatedConversation || fallbackConversation, { title })
                    : conversation
            ))));
            setSelectedConversation((current) => (
                getConversationId(current) === conversationId
                    ? mergeConversationUpdate(current, updatedConversation || fallbackConversation, { title })
                    : current
            ));

            return true;
        } catch (apiError) {
            applyError(apiError);
            return false;
        } finally {
            setActionConversationId('');
        }
    }, [
        actionConversationId,
        applyError,
        isLoggedIn,
    ]);

    const deleteConversation = useCallback(async (conversationId) => {
        if (!conversationId || !isLoggedIn || actionConversationId) return false;

        setActionConversationId(conversationId);
        setError(null);

        try {
            await deleteDocConversation(conversationId, isLoggedIn);
            const deletedIndex = conversations.findIndex(
                (conversation) => getConversationId(conversation) === conversationId,
            );
            const nextConversations = conversations.filter(
                (conversation) => getConversationId(conversation) !== conversationId,
            );
            const fallbackConversation =
                nextConversations[deletedIndex]
                || nextConversations[deletedIndex - 1]
                || nextConversations[0]
                || null;

            loadedConversationIds.current.delete(conversationId);
            setConversations(nextConversations);

            if (selectedConversationId === conversationId) {
                setSelectedConversationId(getConversationId(fallbackConversation));
                setSelectedConversation(fallbackConversation);
            }

            return true;
        } catch (apiError) {
            applyError(apiError);
            return false;
        } finally {
            setActionConversationId('');
        }
    }, [
        actionConversationId,
        applyError,
        conversations,
        isLoggedIn,
        selectedConversationId,
    ]);

    return {
        conversations,
        selectedConversation,
        selectedConversationId,
        loadingList,
        loadingConversation,
        creatingConversation,
        sendingConversationId,
        actionConversationId,
        error,
        selectConversation,
        createConversation,
        sendMessage,
        renameConversation,
        deleteConversation,
        clearError,
        reloadConversations: loadConversations,
    };
};

export default useAskDocConversations;
