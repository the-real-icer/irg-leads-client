import {
    getConversationId,
    getConversationMessages,
    getConversationTitle,
} from '../../utils/askDocFormatters';
import AskDocComposer from './AskDocComposer';
import AskDocEmptyState from './AskDocEmptyState';
import AskDocMessageList from './AskDocMessageList';
import AskDocSuggestedPrompts from './AskDocSuggestedPrompts';

const panelClassName =
    'flex h-full overflow-hidden rounded-[16px] border border-border bg-surface shadow-sm';
const chatPanelClassName = `${panelClassName} min-h-[620px] flex-col`;
const headerClassName =
    'flex flex-wrap items-center justify-between gap-[12px] border-b border-border '
    + 'px-[16px] py-[14px] md:px-[20px]';
const backButtonClassName =
    'inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] '
    + 'text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none '
    + 'focus:ring-2 focus:ring-ring min-[900px]:hidden';
const docAvatarClassName =
    'flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[12px] '
    + 'bg-secondary text-[13px] font-bold text-secondary-foreground';

const AskDocChatPanel = ({
    conversation,
    loading,
    sending,
    composerText,
    creatingConversation,
    onComposerChange,
    onSend,
    onBack,
    onNewChat,
    onPromptClick,
}) => {
    const conversationId = getConversationId(conversation);
    const messages = getConversationMessages(conversation);
    const hasMessages = messages.length > 0;

    if (!conversation && loading) {
        return (
            <section className={`${panelClassName} min-h-[520px]`}>
                <div className="flex flex-1 items-center justify-center text-foreground-muted">
                    <div className="inline-flex items-center gap-[10px] text-[14px]">
                        <i className="pi pi-spin pi-spinner text-[16px]" aria-hidden="true" />
                        Loading conversation...
                    </div>
                </div>
            </section>
        );
    }

    if (!conversation) {
        return (
            <section className={`${panelClassName} min-h-[520px]`}>
                <AskDocEmptyState
                    onNewChat={onNewChat}
                    onPromptClick={onPromptClick}
                    newChatDisabled={creatingConversation}
                />
            </section>
        );
    }

    return (
        <section className={chatPanelClassName}>
            <header className={headerClassName}>
                <div className="flex min-w-0 items-center gap-[10px]">
                    <button
                        type="button"
                        className={backButtonClassName}
                        onClick={onBack}
                        aria-label="Back to conversations"
                    >
                        <i className="pi pi-arrow-left text-[13px]" aria-hidden="true" />
                    </button>
                    <div className={docAvatarClassName}>
                        D
                    </div>
                    <div className="min-w-0">
                        <h2 className="m-0 truncate text-[16px] font-semibold text-foreground">
                            {getConversationTitle(conversation)}
                        </h2>
                        <p className="m-0 mt-[2px] text-[12px] text-foreground-muted">
                            {sending ? 'Waiting for Doc' : 'Ask Doc'}
                        </p>
                    </div>
                </div>
            </header>

            <AskDocMessageList conversation={conversation} loading={loading} />

            {!loading && !hasMessages && (
                <div className="border-t border-border-subtle bg-surface px-[16px] py-[14px] md:px-[20px]">
                    <AskDocSuggestedPrompts onPromptClick={onPromptClick} />
                </div>
            )}

            <AskDocComposer
                value={composerText}
                onChange={onComposerChange}
                onSend={onSend}
                disabled={loading || !conversationId}
                sending={sending}
            />
        </section>
    );
};

export default AskDocChatPanel;
