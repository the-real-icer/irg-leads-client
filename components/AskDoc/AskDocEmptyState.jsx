import AskDocSuggestedPrompts from './AskDocSuggestedPrompts';

const iconClassName =
    'mb-[16px] flex h-[44px] w-[44px] items-center justify-center rounded-[14px] '
    + 'bg-secondary text-secondary-foreground';

const AskDocEmptyState = ({
    title = 'Start a conversation with Doc',
    description = 'Choose a prompt or start a new chat.',
    onNewChat,
    onPromptClick,
    newChatDisabled = false,
    compact = false,
}) => (
    <div className="flex h-full flex-col items-center justify-center px-[20px] py-[32px] text-center">
        <div className={iconClassName}>
            <i className="pi pi-comments text-[18px]" aria-hidden="true" />
        </div>
        <h2 className="m-0 text-[20px] font-semibold text-foreground">{title}</h2>
        <p className="mb-[22px] mt-[8px] max-w-[420px] text-[14px] leading-[1.55] text-foreground/70">
            {description}
        </p>
        <div className="mb-[18px] w-full max-w-[560px]">
            <AskDocSuggestedPrompts onPromptClick={onPromptClick} compact={compact} />
        </div>
        <button
            type="button"
            className={
                'inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-primary '
                + 'px-[16px] py-[10px] text-[14px] font-semibold text-primary-foreground '
                + 'transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 '
                + 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
            }
            disabled={newChatDisabled}
            onClick={onNewChat}
        >
            <i
                className={`pi ${newChatDisabled ? 'pi-spin pi-spinner' : 'pi-plus'}`}
                aria-hidden="true"
            />
            New Chat
        </button>
    </div>
);

export default AskDocEmptyState;
