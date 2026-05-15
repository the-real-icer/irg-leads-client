export const SUGGESTED_ASK_DOC_PROMPTS = [
    'What are current San Diego market conditions?',
    'Help me sanity check a listing price.',
    'What comps should I look for?',
    'How would you explain this market to a seller?',
];

export const getConversationId = (conversation) => (
    conversation?._id || conversation?.id || conversation?.conversationId || ''
);

export const getMessageId = (message) => (
    message?._id
    || message?.id
    || message?.clientRequestId
    || `${message?.role || 'message'}-${message?.createdAt || ''}-${message?.content || ''}`
);

export const getConversationTitle = (conversation) => {
    const title = conversation?.title?.trim?.();
    return title || 'Ask Doc';
};

export const getConversationMessages = (conversation) => {
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    return [...messages].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
    });
};

const getLastMessage = (conversation) => {
    if (conversation?.lastMessage?.content || conversation?.lastMessage?.message) {
        return conversation.lastMessage;
    }

    const messages = getConversationMessages(conversation);
    return messages[messages.length - 1] || null;
};

export const getConversationPreview = (conversation) => {
    const lastMessage = getLastMessage(conversation);
    const content = lastMessage?.content || lastMessage?.message || conversation?.lastMessagePreview || '';
    const text = String(content || '').replace(/\s+/g, ' ').trim();

    if (!text) return 'No messages yet';
    return text.length > 96 ? `${text.slice(0, 93)}...` : text;
};

export const getConversationTimestamp = (conversation) => (
    conversation?.lastMessageAt
    || conversation?.updatedAt
    || conversation?.createdAt
    || getLastMessage(conversation)?.createdAt
    || ''
);

export const sortConversations = (conversations) => [...conversations].sort((a, b) => {
    const aTime = getConversationTimestamp(a) ? new Date(getConversationTimestamp(a)).getTime() : 0;
    const bTime = getConversationTimestamp(b) ? new Date(getConversationTimestamp(b)).getTime() : 0;
    return bTime - aTime;
});

export const formatCompactDate = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const sameYear = date.getFullYear() === now.getFullYear();

    if (sameDay) {
        return new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    }

    if (sameYear) {
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
    }).format(date);
};

export const formatMessageTime = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

export const formatLatency = (latencyMs) => {
    const latency = Number(latencyMs);
    if (!Number.isFinite(latency) || latency <= 0) return '';
    if (latency >= 1000) return `${(latency / 1000).toFixed(1)}s`;
    return `${Math.round(latency)}ms`;
};

export const getTokenTotal = (tokenUsage) => {
    if (!tokenUsage || typeof tokenUsage !== 'object') return '';
    const total =
        tokenUsage.total
        || tokenUsage.totalTokens
        || tokenUsage.total_tokens
        || tokenUsage.tokens
        || '';
    return total ? `${total} tokens` : '';
};

export const getAssistantMetadata = (message) => {
    if (!message || message.role === 'user') return [];

    const modelParts = [message.provider, message.model].filter(Boolean).join(' / ');
    return [
        modelParts,
        formatLatency(message.latencyMs),
        getTokenTotal(message.tokenUsage),
    ].filter(Boolean);
};

export const createClientRequestId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const randomPart = Math.random().toString(36).slice(2, 10);
    return `ask-doc-${Date.now().toString(36)}-${randomPart}`;
};

export const formatSafeAssistantError = (error) => {
    const rawCode = typeof error === 'object' ? error?.code : '';
    const rawMessage = typeof error === 'object' ? error?.message : error;
    const text = [rawCode, rawMessage].filter(Boolean).join(': ').trim();

    if (!text) return 'Assistant delivery failed.';

    if (/secret|token|api key|apikey|authorization|bearer/i.test(text)) {
        return 'Assistant delivery failed. Details are hidden for security.';
    }

    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
};
