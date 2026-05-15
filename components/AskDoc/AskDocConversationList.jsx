import AskDocConversationListItem from './AskDocConversationListItem';
import AskDocSuggestedPrompts from './AskDocSuggestedPrompts';
import { getConversationId } from '../../utils/askDocFormatters';

const listClassName =
    'flex h-full min-h-[420px] flex-col overflow-hidden rounded-[16px] '
    + 'border border-border bg-surface shadow-sm';
const newButtonClassName =
    'inline-flex items-center justify-center gap-[7px] rounded-[10px] bg-primary '
    + 'px-[12px] py-[9px] text-[13px] font-semibold text-primary-foreground '
    + 'transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 '
    + 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background';
const emptyPanelClassName =
    'rounded-[14px] border border-border bg-surface-elevated px-[16px] '
    + 'py-[18px] text-center';
const emptyIconClassName =
    'mx-auto mb-[12px] flex h-[38px] w-[38px] items-center justify-center '
    + 'rounded-[12px] bg-secondary text-secondary-foreground';

const AskDocConversationList = ({
    conversations,
    selectedConversationId,
    loading,
    creatingConversation,
    actionConversationId,
    onSelectConversation,
    onRenameConversation,
    onDeleteConversation,
    onNewChat,
    onPromptClick,
}) => {
    const hasConversations = conversations.length > 0;

    return (
        <aside className={listClassName}>
            <div className="border-b border-border px-[18px] py-[16px]">
                <div className="flex items-center justify-between gap-[12px]">
                    <div>
                        <h2 className="m-0 text-[16px] font-semibold text-foreground">Conversations</h2>
                        <p className="m-0 mt-[2px] text-[12px] text-foreground-muted">
                            {loading ? 'Loading...' : `${conversations.length} active`}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={newButtonClassName}
                        disabled={creatingConversation}
                        onClick={onNewChat}
                    >
                        <i
                            className={`pi ${
                                creatingConversation ? 'pi-spin pi-spinner' : 'pi-plus'
                            } text-[12px]`}
                            aria-hidden="true"
                        />
                        New
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[10px] py-[12px]">
                {loading && (
                    <div className="space-y-[10px] px-[4px]">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="h-[72px] animate-pulse rounded-[12px] bg-muted"
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                )}

                {!loading && hasConversations && (
                    <ul className="m-0 list-none space-y-[8px] p-0">
                        {conversations.map((conversation) => {
                            const conversationId = getConversationId(conversation);
                            return (
                                <AskDocConversationListItem
                                    key={conversationId}
                                    conversation={conversation}
                                    selected={selectedConversationId === conversationId}
                                    actionLoading={actionConversationId === conversationId}
                                    onSelect={onSelectConversation}
                                    onRename={onRenameConversation}
                                    onDelete={onDeleteConversation}
                                />
                            );
                        })}
                    </ul>
                )}

                {!loading && !hasConversations && (
                    <div className="px-[8px] py-[18px]">
                        <div className={emptyPanelClassName}>
                            <div className={emptyIconClassName}>
                                <i className="pi pi-comments text-[16px]" aria-hidden="true" />
                            </div>
                            <h3 className="m-0 text-[15px] font-semibold text-foreground">
                                No conversations yet
                            </h3>
                            <p className="mb-[16px] mt-[6px] text-[13px] leading-[1.45] text-foreground-muted">
                                Start with a prompt or create a blank chat.
                            </p>
                            <div className="mb-[16px]">
                                <AskDocSuggestedPrompts onPromptClick={onPromptClick} compact />
                            </div>
                            <button
                                type="button"
                                className={
                                    'inline-flex items-center justify-center gap-[7px] rounded-[10px] bg-primary '
                                    + 'px-[13px] py-[9px] text-[13px] font-semibold text-primary-foreground '
                                    + 'transition-colors hover:bg-primary-hover disabled:cursor-not-allowed '
                                    + 'disabled:opacity-60'
                                }
                                onClick={onNewChat}
                                disabled={creatingConversation}
                            >
                                <i
                                    className={`pi ${
                                        creatingConversation ? 'pi-spin pi-spinner' : 'pi-plus'
                                    } text-[12px]`}
                                    aria-hidden="true"
                                />
                                New Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default AskDocConversationList;
