const EMPTY_VALUE = '—';

export const getQmaRecordId = (record) => (
    record?._id || record?.id || record?.analysisId || record?.subscriptionId || ''
);

const asObject = (value) => (
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.docs)) return value.docs;
    if (Array.isArray(value?.analyses)) return value.analyses;
    if (Array.isArray(value?.history)) return value.history;
    return [];
};

const cleanText = (value) => (
    value === undefined || value === null ? '' : String(value).trim()
);

const cleanAddressPart = (value) => cleanText(value).replace(/\s+/g, ' ');

const firstText = (...values) => {
    const found = values.find((value) => cleanText(value));
    return cleanText(found);
};

const toBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) return true;
        if (['false', '0', 'no'].includes(normalized)) return false;
    }

    return fallback;
};

const titleCase = (value) => (
    cleanText(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
);

const getNested = (source, paths) => (
    paths
        .map((path) => path.split('.').reduce((current, part) => current?.[part], source))
        .find((value) => value !== undefined && value !== null && value !== '')
);

const getLeadAddressSource = (lead) => {
    const address = asObject(lead?.address);
    const profile = asObject(lead?.backend_profile);

    return {
        full: firstText(
            address.full,
            address.fullAddress,
            address.formatted,
            profile.property_address,
            profile.address,
        ),
        street: firstText(
            address.street,
            address.streetAddress,
            address.address1,
            address.line1,
            profile.street,
        ),
        city: firstText(address.city, lead?.user_location?.city, profile.city),
        state: firstText(address.state, lead?.user_location?.state, profile.state),
        zip: firstText(address.zip, address.zipCode, address.postalCode, profile.zip),
        source: 'lead_address',
    };
};

const isUsableExplicitFullAddress = (value) => {
    const cleaned = cleanAddressPart(value);
    if (!cleaned || /^\d+$/.test(cleaned)) return false;
    return /[A-Za-z]/.test(cleaned) && /\s/.test(cleaned);
};

const getQmaAddressParts = (address) => {
    const normalized = asObject(address);
    const state = cleanAddressPart(normalized.state);

    return {
        street: cleanAddressPart(
            normalized.street || normalized.streetAddress || normalized.address1 || normalized.line1,
        ),
        city: cleanAddressPart(normalized.city),
        state: state.length === 2 ? state.toUpperCase() : state,
        zip: cleanAddressPart(normalized.zip || normalized.zipCode || normalized.postalCode),
    };
};

export const buildQmaAddressFromParts = (address) => {
    const { street, city, state, zip } = getQmaAddressParts(address);

    if (!street || !city || !state || !zip || /^\d+$/.test(street)) return '';

    return `${street}, ${city}, ${state} ${zip}`;
};

export const buildQmaFullAddress = (address) => {
    if (typeof address === 'string') {
        return isUsableExplicitFullAddress(address) ? cleanAddressPart(address) : '';
    }

    const builtFull = buildQmaAddressFromParts(address);
    if (builtFull) return builtFull;

    const normalized = asObject(address);
    const explicitFull = firstText(normalized.full, normalized.fullAddress, normalized.formatted);

    return isUsableExplicitFullAddress(explicitFull) ? cleanAddressPart(explicitFull) : '';
};

export const normalizeQmaAddress = (address, fallbackLead = null) => {
    const source = asObject(address);
    const leadAddress = getLeadAddressSource(fallbackLead);
    const normalized = {
        full: firstText(source.full, source.fullAddress, source.formatted, leadAddress.full),
        street: firstText(source.street, source.streetAddress, source.address1, source.line1, leadAddress.street),
        city: firstText(source.city, leadAddress.city),
        state: firstText(source.state, leadAddress.state),
        zip: firstText(source.zip, source.zipCode, source.postalCode, leadAddress.zip),
        source: firstText(source.source, leadAddress.source),
    };

    return {
        ...normalized,
        full: buildQmaAddressFromParts(normalized),
    };
};

export const buildQmaSubjectAddressPayload = (address, source = 'agent_confirmed') => {
    const normalized = normalizeQmaAddress(address);
    const parts = getQmaAddressParts(normalized);

    return {
        full: buildQmaAddressFromParts(parts),
        street: parts.street,
        city: parts.city,
        state: parts.state,
        zip: parts.zip,
        source,
    };
};

export const hasQmaAddress = (address) => {
    return Boolean(buildQmaAddressFromParts(address));
};

export const formatQmaDateTime = (value, fallback = EMPTY_VALUE) => {
    if (!value) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const formatQmaDate = (value, fallback = EMPTY_VALUE) => {
    if (!value) return fallback;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const formatQmaStatus = (status, fallback = 'Not available') => {
    const cleaned = cleanText(status);
    return cleaned ? titleCase(cleaned) : fallback;
};

export const getQmaAnalysisStatus = (analysis) => (
    firstText(
        analysis?.status,
        analysis?.analysisStatus,
        analysis?.analysis_status,
        analysis?.generationStatus,
        analysis?.generation_status,
    ) || (analysis ? 'generated' : '')
);

export const getQmaEmailStatus = (analysis) => {
    const status = firstText(
        analysis?.emailStatus,
        analysis?.email_status,
        analysis?.email?.status,
        analysis?.sendStatus,
        analysis?.send_status,
    );

    if (status) return status;
    if (getQmaSentAt(analysis)) return 'sent';
    return analysis ? 'not_sent' : '';
};

export const getQmaGeneratedAt = (analysis) => (
    getNested(analysis, [
        'generatedAt',
        'generated_at',
        'completedAt',
        'completed_at',
        'analysis.generatedAt',
        'summary.generatedAt',
    ])
);

export const getQmaSentAt = (analysis) => (
    getNested(analysis, [
        'sentAt',
        'sent_at',
        'emailSentAt',
        'email_sent_at',
        'email.sentAt',
        'email.sent_at',
        'email.lastSentAt',
    ])
);

export const getQmaQuarterLabel = (analysis) => {
    const explicit = firstText(
        analysis?.quarterLabel,
        analysis?.quarter_label,
        analysis?.quarterKey,
        analysis?.quarter_key,
    );
    if (explicit) return explicit;

    const quarter = analysis?.quarter;
    if (typeof quarter === 'string' && quarter.trim()) return quarter.trim();

    const quarterObject = asObject(quarter);
    const quarterValue = quarterObject.quarter || analysis?.quarterNumber || analysis?.quarter_number;
    const yearValue = quarterObject.year || analysis?.year;
    if (quarterValue && yearValue) {
        const normalizedQuarter = String(quarterValue).toUpperCase().replace(/^Q?/, 'Q');
        return `${normalizedQuarter} ${yearValue}`;
    }

    const generatedAt = getQmaGeneratedAt(analysis);
    if (generatedAt) {
        const date = new Date(generatedAt);
        if (!Number.isNaN(date.getTime())) {
            return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        }
    }

    return EMPTY_VALUE;
};

export const formatQmaConfidence = (analysis) => {
    const value = getNested(analysis, [
        'confidence',
        'confidenceScore',
        'confidence_score',
        'summary.confidence',
        'analysis.confidence',
    ]);

    if (value === undefined || value === null || value === '') return EMPTY_VALUE;

    if (typeof value === 'number') {
        if (value <= 1) return `${Math.round(value * 100)}%`;
        return `${Math.round(value)}%`;
    }

    return String(value);
};

export const isQmaAnalysisGenerated = (analysis) => {
    if (!analysis) return false;
    const status = getQmaAnalysisStatus(analysis).toLowerCase();
    return Boolean(
        getQmaGeneratedAt(analysis)
        || ['generated', 'completed', 'complete', 'ready', 'succeeded', 'success'].includes(status),
    );
};

export const isQmaEmailSent = (analysis) => {
    const status = getQmaEmailStatus(analysis).toLowerCase();
    return Boolean(getQmaSentAt(analysis) || ['sent', 'delivered', 'emailed'].includes(status));
};

export const extractQmaAnalyses = (payload) => {
    const root = payload?.data ?? payload ?? {};
    return asArray(
        root.history
        || root.analyses
        || root.recentAnalyses
        || root.recent_analyses
        || root.items
        || root.results
        || root.docs,
    );
};

export const buildDefaultQmaState = (lead) => {
    const subjectAddress = normalizeQmaAddress(null, lead);

    return {
        enabled: false,
        active: false,
        subscription: null,
        subscriptionId: '',
        defaultSubjectAddress: subjectAddress,
        subjectAddress,
        latestAnalysis: null,
        history: [],
        nextScheduledAt: null,
        leadHasEmail: Boolean(cleanText(lead?.email)),
        leadGloballyUnsubscribed: lead?.email_preferences?.unsubscribed_all === true,
    };
};

export const normalizeQmaSubscriptionPayload = (payload, lead) => {
    const root = payload?.data ?? payload ?? {};
    const candidateSubscription = root.subscription || root.qmaSubscription || root.qma_subscription || null;
    const subscription = getQmaRecordId(candidateSubscription) ? candidateSubscription : null;
    const defaultSubjectAddress = normalizeQmaAddress(
        root.defaultSubjectAddress || root.default_subject_address,
        lead,
    );
    const subjectAddress = normalizeQmaAddress(
        subscription?.subjectAddress
        || subscription?.subject_address
        || root.subjectAddress
        || root.subject_address
        || defaultSubjectAddress,
        lead,
    );
    const history = extractQmaAnalyses(root);
    const latestAnalysis =
        root.latestAnalysis
        || root.latest_analysis
        || root.latest
        || history[0]
        || null;

    const activeValue =
        root.active
        ?? root.enabled
        ?? subscription?.active
        ?? subscription?.enabled
        ?? false;
    const leadHasEmailValue =
        root.leadHasEmail
        ?? root.hasEmail
        ?? root.has_email;
    const leadGloballyUnsubscribedValue =
        root.leadGloballyUnsubscribed
        ?? root.globallyUnsubscribed
        ?? root.unsubscribedAll
        ?? root.unsubscribed_all;

    return {
        enabled: Boolean(subscription || toBoolean(activeValue, false)),
        active: toBoolean(activeValue, false),
        subscription,
        subscriptionId: getQmaRecordId(subscription),
        defaultSubjectAddress,
        subjectAddress,
        latestAnalysis,
        history,
        nextScheduledAt:
            root.nextScheduledAt
            || root.next_scheduled_at
            || subscription?.nextScheduledAt
            || subscription?.next_scheduled_at
            || null,
        leadHasEmail: toBoolean(leadHasEmailValue, Boolean(cleanText(lead?.email))),
        leadGloballyUnsubscribed: toBoolean(
            leadGloballyUnsubscribedValue,
            lead?.email_preferences?.unsubscribed_all === true,
        ),
    };
};

export const mergeQmaHistory = (state, historyPayload) => {
    const history = extractQmaAnalyses(historyPayload);
    if (history.length === 0) return state;

    return {
        ...state,
        history,
        latestAnalysis: state.latestAnalysis || history[0],
    };
};

export const getQmaAnalysisSummary = (analysis) => {
    const summary = analysis?.summary || analysis?.analysis?.summary || analysis?.snapshot?.summary;
    if (typeof summary === 'string') return summary.trim();

    const summaryObject = asObject(summary);
    return firstText(
        summaryObject.overview,
        summaryObject.marketSummary,
        summaryObject.market_summary,
        summaryObject.executiveSummary,
        summaryObject.executive_summary,
        summaryObject.body,
        analysis?.overview,
        analysis?.marketSummary,
        analysis?.market_summary,
    );
};

const normalizeCompAddress = (comp) => {
    const address = comp?.address;
    if (typeof address === 'string') return address.trim();

    return buildQmaFullAddress({
        full: address?.full || address?.formatted,
        street: address?.street || comp?.street,
        city: address?.city || comp?.city,
        state: address?.state || comp?.state,
        zip: address?.zip || comp?.zip,
    });
};

export const getQmaAnalysisComps = (analysis) => {
    const comps = asArray(
        analysis?.comps
        || analysis?.comparables
        || analysis?.comparableSales
        || analysis?.comparable_sales
        || analysis?.analysis?.comps
        || analysis?.analysis?.comparables
        || analysis?.snapshot?.comps
        || analysis?.summary?.comps,
    );

    return comps.slice(0, 4).map((comp, index) => ({
        id: getQmaRecordId(comp) || `${normalizeCompAddress(comp)}-${index}`,
        label: `Comp ${index + 1}`,
        address: normalizeCompAddress(comp) || `Comparable ${index + 1}`,
        price: comp?.salePrice || comp?.soldPrice || comp?.closedPrice || comp?.price || null,
        soldAt: comp?.soldDate || comp?.saleDate || comp?.closedDate || comp?.date || null,
        beds: comp?.beds || comp?.bedrooms || null,
        baths: comp?.baths || comp?.bathrooms || null,
        sqft: comp?.sqft || comp?.squareFeet || comp?.livingArea || comp?.living_area || null,
        distance: comp?.distanceMiles || comp?.distance_miles || comp?.distance || null,
        rationale:
            comp?.rationale
            || comp?.adjustmentRationale
            || comp?.adjustment_rationale
            || comp?.comparisonNotes
            || comp?.comparison_notes
            || '',
    }));
};

export const formatQmaCurrency = (value) => {
    if (value === undefined || value === null || value === '') return EMPTY_VALUE;
    const numericValue = Number(String(value).replace(/[$,]/g, ''));

    if (Number.isNaN(numericValue)) return String(value);

    return numericValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });
};

export const formatQmaNumber = (value, suffix = '') => {
    if (value === undefined || value === null || value === '') return EMPTY_VALUE;
    const numericValue = Number(String(value).replace(/,/g, ''));

    if (Number.isNaN(numericValue)) return `${value}${suffix}`;

    return `${numericValue.toLocaleString('en-US')}${suffix}`;
};

export const getQmaDataWarnings = (analysis) => {
    const warnings = (
        analysis?.dataWarnings
        || analysis?.data_warnings
        || analysis?.warnings
        || analysis?.summary?.dataWarnings
        || analysis?.summary?.warnings
        || []
    );

    if (typeof warnings === 'string') return warnings.trim() ? [warnings.trim()] : [];
    return asArray(warnings).map((warning) => String(warning).trim()).filter(Boolean);
};

export const getQmaDisclaimer = (analysis) => (
    firstText(
        analysis?.disclaimer,
        analysis?.summary?.disclaimer,
        analysis?.analysis?.disclaimer,
        analysis?.snapshot?.disclaimer,
    )
);

export const getQmaDocMetadataRows = (analysis) => {
    const metadata = asObject(
        analysis?.docMetadata
        || analysis?.doc_metadata
        || analysis?.metadata?.doc
        || analysis?.generationMetadata
        || analysis?.generation_metadata,
    );

    return [
        { label: 'Provider', value: firstText(metadata.provider, analysis?.provider) },
        { label: 'Model', value: firstText(metadata.model, metadata.modelName, analysis?.model) },
        {
            label: 'Doc timestamp',
            value: formatQmaDateTime(
                metadata.reportedGeneratedAt
                || metadata.reported_generated_at
                || metadata.generatedAt
                || metadata.generated_at,
                '',
            ),
        },
    ].filter((row) => row.value);
};

export const normalizeQmaApiError = (error, fallbackMessage = 'Quarterly Market Analysis request failed.') => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const responseMessage =
        data?.message
        || data?.error?.message
        || (typeof data?.error === 'string' ? data.error : '')
        || error?.message
        || '';
    const code = data?.code || data?.error?.code || error?.code || '';
    const text = `${code} ${responseMessage}`;

    if (/email.*not[\s_-]*configured|mail.*not[\s_-]*configured|sending.*not[\s_-]*configured/i.test(text)) {
        return {
            kind: 'email-not-configured',
            message: 'Quarterly Market Analysis email sending is not configured.',
            status,
        };
    }

    if (
        /generation.*not[\s_-]*configured|analysis.*not[\s_-]*configured|doc.*not[\s_-]*configured/i.test(text)
        || /not[\s_-]*configured.*generation|not[\s_-]*configured.*analysis|not[\s_-]*configured.*doc/i.test(text)
        || /qma_not_configured/i.test(text)
    ) {
        return {
            kind: 'generation-not-configured',
            message: 'Quarterly Market Analysis generation is not configured.',
            status,
        };
    }

    if (
        status === 408
        || status === 502
        || status === 503
        || status === 504
        || code === 'ECONNABORTED'
        || /timeout|timed out|unavailable/i.test(responseMessage)
    ) {
        return {
            kind: 'unavailable',
            message: 'Doc is taking longer than expected. Try again later.',
            status,
        };
    }

    if (/invalid.*comp|invalid.*comparable|placeholder.*comp|comparable.*invalid/i.test(text)) {
        return {
            kind: 'invalid-comps',
            message: 'Quarterly Market Analysis contains invalid comparable data.',
            status,
        };
    }

    if (/already.*sent|duplicate.*send|duplicate.*email/i.test(text)) {
        return {
            kind: 'already-sent',
            message: 'This Quarterly Market Analysis email has already been sent.',
            status,
        };
    }

    return {
        kind: 'request-failed',
        message: responseMessage && responseMessage.length < 180 ? responseMessage : fallbackMessage,
        status,
    };
};
