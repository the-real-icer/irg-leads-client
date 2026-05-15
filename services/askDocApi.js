import IrgApi from '../assets/irgApi';

const DOC_CONVERSATIONS_PATH = '/doc-conversations';

const authConfig = (token) => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
});

const unwrapData = (response) => response?.data?.data ?? response?.data ?? null;

const extractConversationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.conversations)) return payload.conversations;
    if (Array.isArray(payload?.docs)) return payload.docs;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const extractConversation = (payload) => payload?.conversation ?? payload ?? null;

export const normalizeAskDocApiError = (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const responseMessage =
        data?.message
        || data?.error?.message
        || (typeof data?.error === 'string' ? data.error : '')
        || '';
    const code = data?.code || data?.error?.code || error?.code || '';

    if (/ask doc is not configured/i.test(responseMessage)) {
        return {
            code: code || 'ASK_DOC_NOT_CONFIGURED',
            message: 'Ask Doc is not configured.',
            status,
            kind: 'not-configured',
        };
    }

    if (
        status === 408
        || status === 502
        || status === 503
        || status === 504
        || code === 'ECONNABORTED'
        || /timeout|timed out|network error|unavailable/i.test(responseMessage || error?.message || '')
    ) {
        return {
            code: code || 'ASK_DOC_UNAVAILABLE',
            message: 'Doc is taking longer than expected. Try again in a minute.',
            status,
            kind: 'unavailable',
        };
    }

    if (status === 429) {
        return {
            code: code || 'ASK_DOC_RATE_LIMITED',
            message: responseMessage || 'Ask Doc is rate limited. Try again shortly.',
            status,
            kind: 'rate-limited',
        };
    }

    return {
        code: code || 'ASK_DOC_REQUEST_FAILED',
        message: responseMessage || 'Ask Doc could not complete that request.',
        status,
        kind: 'request-failed',
    };
};

export const listDocConversations = async ({ status = 'active', page = 1, limit = 25 }, token) => {
    const response = await IrgApi.get(DOC_CONVERSATIONS_PATH, {
        ...authConfig(token),
        params: { status, page, limit },
    });
    return extractConversationList(unwrapData(response));
};

export const createDocConversation = async ({ title = 'Ask Doc', context = {} }, token) => {
    const response = await IrgApi.post(
        DOC_CONVERSATIONS_PATH,
        { title, context },
        authConfig(token),
    );
    return extractConversation(unwrapData(response));
};

export const getDocConversation = async (id, token) => {
    const response = await IrgApi.get(`${DOC_CONVERSATIONS_PATH}/${id}`, authConfig(token));
    return extractConversation(unwrapData(response));
};

export const sendDocMessage = async ({ conversationId, message, clientRequestId }, token) => {
    const response = await IrgApi.post(
        `${DOC_CONVERSATIONS_PATH}/${conversationId}/messages`,
        { message, clientRequestId },
        authConfig(token),
    );
    const payload = unwrapData(response);
    return {
        conversation: payload?.conversation ?? null,
        assistantMessage: payload?.assistantMessage ?? null,
    };
};

export const updateDocConversation = async (id, patch, token) => {
    const response = await IrgApi.patch(
        `${DOC_CONVERSATIONS_PATH}/${id}`,
        patch,
        authConfig(token),
    );
    return extractConversation(unwrapData(response));
};

export const deleteDocConversation = async (id, token) => {
    const response = await IrgApi.delete(`${DOC_CONVERSATIONS_PATH}/${id}`, authConfig(token));
    return unwrapData(response);
};
