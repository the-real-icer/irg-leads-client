import { SUGGESTED_ASK_DOC_PROMPTS } from '../../utils/askDocFormatters';

const AskDocSuggestedPrompts = ({ onPromptClick, compact = false }) => (
    <div className={compact ? 'space-y-[8px]' : 'grid gap-[10px] sm:grid-cols-2'}>
        {SUGGESTED_ASK_DOC_PROMPTS.map((prompt) => (
            <button
                key={prompt}
                type="button"
                className={
                    'w-full rounded-[12px] border border-border bg-surface px-[14px] py-[11px] '
                    + 'text-left text-[13px] font-medium text-foreground transition-colors '
                    + 'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 '
                    + 'focus:ring-offset-background'
                }
                onClick={() => onPromptClick(prompt)}
            >
                {prompt}
            </button>
        ))}
    </div>
);

export default AskDocSuggestedPrompts;
