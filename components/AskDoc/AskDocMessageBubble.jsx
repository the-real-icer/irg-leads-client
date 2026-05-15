import {
    formatMessageTime,
    formatSafeAssistantError,
    getAssistantMetadata,
} from '../../utils/askDocFormatters';

const isUserMessage = (message) => message?.role === 'user';

const isFailedMessage = (message) => (
    message?.status === 'failed'
    || message?.status === 'error'
    || message?.deliverySucceeded === false
);

const assistantAvatarClassName =
    'mt-[2px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] '
    + 'bg-secondary text-[12px] font-bold text-secondary-foreground';
const assistantLabelClassName =
    'mb-[5px] flex items-center gap-[8px] text-[11px] font-semibold uppercase '
    + 'tracking-[0.04em] text-foreground/50';
const failedErrorClassName =
    'm-0 mt-[8px] whitespace-pre-wrap break-words text-[12px] font-medium text-danger';

const AskDocMessageBubble = ({ message }) => {
    const userMessage = isUserMessage(message);
    const failed = !userMessage && isFailedMessage(message);
    const pending = message?.pending || message?.status === 'pending';
    const metadata = getAssistantMetadata(message);
    const messageTime = formatMessageTime(message?.createdAt);

    return (
        <div className={`flex w-full gap-[10px] ${userMessage ? 'justify-end' : 'justify-start'}`}>
            {!userMessage && (
                <div className={assistantAvatarClassName}>
                    D
                </div>
            )}
            <div className={`max-w-[min(760px,84%)] ${userMessage ? 'items-end' : 'items-start'}`}>
                {!userMessage && (
                    <div className={assistantLabelClassName}>
                        Doc
                    </div>
                )}
                <div
                    className={
                        'rounded-[14px] px-[14px] py-[11px] text-[14px] leading-[1.55] shadow-xs '
                        + (userMessage
                            ? 'bg-primary text-primary-foreground'
                            : failed
                                ? 'border border-danger/30 bg-danger/10 text-foreground'
                                : 'border border-border bg-muted text-foreground')
                    }
                >
                    {pending ? (
                        <span className="inline-flex items-center gap-[8px] text-foreground/70">
                            <i className="pi pi-spin pi-spinner text-[13px]" aria-hidden="true" />
                            Doc is thinking...
                        </span>
                    ) : (
                        <p className="m-0 whitespace-pre-wrap break-words">
                            {message?.content || (
                                failed ? formatSafeAssistantError(message?.error) : ''
                            )}
                        </p>
                    )}

                    {failed && message?.error && (
                        <p className={failedErrorClassName}>
                            {formatSafeAssistantError(message.error)}
                        </p>
                    )}
                </div>
                <div
                    className={
                        'mt-[5px] flex flex-wrap items-center gap-[8px] text-[11px] text-foreground/50 '
                        + (userMessage ? 'justify-end' : 'justify-start')
                    }
                >
                    {messageTime && <span>{messageTime}</span>}
                    {!userMessage && metadata.length > 0 && (
                        <details className="group">
                            <summary
                                className="cursor-pointer list-none rounded-[6px] px-[4px] py-[1px] hover:bg-accent"
                            >
                                Details
                            </summary>
                            <span className="mt-[3px] block text-[11px] text-foreground/50">
                                {metadata.join(' / ')}
                            </span>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AskDocMessageBubble;
