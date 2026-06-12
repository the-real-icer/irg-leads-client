import IrgApi from '../assets/irgApi';

const QMA_PATH = '/quarterly-market-analyses';

const authConfig = (token) => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
});

const unwrapData = (response) => response?.data?.data ?? response?.data ?? null;

export const getQmaSubscription = async (leadId, token) => {
    const response = await IrgApi.get(
        `${QMA_PATH}/lead/${leadId}/subscription`,
        authConfig(token),
    );
    return unwrapData(response);
};

export const enableQmaSubscription = async (leadId, payload, token) => {
    const response = await IrgApi.post(
        `${QMA_PATH}/lead/${leadId}/subscription`,
        payload,
        authConfig(token),
    );
    return unwrapData(response);
};

export const updateQmaSubscription = async (subscriptionId, patch, token) => {
    const response = await IrgApi.patch(
        `${QMA_PATH}/subscriptions/${subscriptionId}`,
        patch,
        authConfig(token),
    );
    return unwrapData(response);
};

export const listQmaAnalyses = async (subscriptionId, params = {}, token) => {
    const response = await IrgApi.get(
        `${QMA_PATH}/subscriptions/${subscriptionId}/analyses`,
        {
            ...authConfig(token),
            params,
        },
    );
    return unwrapData(response);
};

export const getQmaAnalysis = async (analysisId, token) => {
    const response = await IrgApi.get(
        `${QMA_PATH}/analyses/${analysisId}`,
        authConfig(token),
    );
    return unwrapData(response);
};

export const manualTriggerQma = async (subscriptionId, payload = {}, token) => {
    const response = await IrgApi.post(
        `${QMA_PATH}/subscriptions/${subscriptionId}/manual-trigger`,
        payload,
        authConfig(token),
    );
    return unwrapData(response);
};

export const sendQmaEmail = async (analysisId, payload = {}, token) => {
    const response = await IrgApi.post(
        `${QMA_PATH}/analyses/${analysisId}/send-email`,
        payload,
        authConfig(token),
    );
    return unwrapData(response);
};
