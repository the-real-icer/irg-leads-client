const formClassName =
    'border-t border-border bg-surface px-[14px] py-[12px] md:px-[18px]';
const shellClassName =
    'flex items-end gap-[10px] rounded-[14px] border border-border bg-background '
    + 'p-[8px] shadow-xs focus-within:ring-2 focus-within:ring-ring';

const AskDocComposer = ({
    value,
    onChange,
    onSend,
    disabled = false,
    sending = false,
}) => {
    const trimmedValue = value.trim();
    const sendDisabled = disabled || sending || !trimmedValue;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!sendDisabled) {
            onSend();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent?.isComposing) return;

        event.preventDefault();
        if (!sendDisabled) {
            onSend();
        }
    };

    return (
        <form className={formClassName} onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="ask-doc-composer">
                Message Doc
            </label>
            <div className={shellClassName}>
                <textarea
                    id="ask-doc-composer"
                    className={
                        'min-h-[48px] max-h-[180px] flex-1 resize-none border-0 bg-transparent '
                        + 'px-[8px] py-[9px] text-[14px] leading-[1.45] text-foreground outline-none '
                        + 'placeholder:text-foreground/45 disabled:cursor-not-allowed disabled:opacity-70'
                    }
                    rows={2}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Doc..."
                    aria-label="Message Doc"
                    disabled={disabled || sending}
                />
                <button
                    type="submit"
                    className={
                        'inline-flex h-[42px] shrink-0 items-center justify-center gap-[8px] rounded-[11px] '
                        + 'bg-primary px-[14px] text-[13px] font-semibold text-primary-foreground '
                        + 'transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 '
                        + 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 '
                        + 'focus:ring-offset-background'
                    }
                    disabled={sendDisabled}
                >
                    <i
                        className={`pi ${sending ? 'pi-spin pi-spinner' : 'pi-send'} text-[13px]`}
                        aria-hidden="true"
                    />
                    <span className="hidden sm:inline">{sending ? 'Sending' : 'Send'}</span>
                </button>
            </div>
        </form>
    );
};

export default AskDocComposer;
