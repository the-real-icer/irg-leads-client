import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ConfirmOffMarketDialog = ({
    showConfirmDialog,
    setShowConfirmDialog,
    handleOffMarketSubmit,
}) => {
    const close = useCallback(() => setShowConfirmDialog(false), [setShowConfirmDialog]);

    // Close on Escape
    useEffect(() => {
        if (!showConfirmDialog) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showConfirmDialog, close]);

    if (!showConfirmDialog) return null;

    return (
        // Backdrop — click or Enter/Space to close
        <div
            className="fixed inset-0 z-modal-backdrop bg-black/50 flex items-center justify-center"
            onClick={close}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') close(); }}
            role="button"
            tabIndex={-1}
        >
            {/* Dialog panel */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
                className="bg-surface rounded-lg shadow-modal w-full max-w-[640px] mx-4"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-offmarket-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2
                        id="confirm-offmarket-title"
                        className="text-lg font-semibold text-foreground m-0"
                    >
                        Confirm Change To Off Market
                    </h2>
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors
                            duration-150 cursor-pointer bg-transparent border-none
                            text-xl leading-none p-1"
                        onClick={close}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center py-8 px-6 gap-2">
                    <h1 className="text-2xl font-bold text-foreground m-0">
                        ARE YOU SURE???
                    </h1>
                    <h2 className="text-xl font-semibold text-foreground m-0 mt-4">
                        THIS IS OFF MARKET
                    </h2>
                    <h2 className="text-xl font-semibold text-foreground m-0 mt-4">
                        NOT DISPLAY BACK
                    </h2>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 px-6 pb-6">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2
                            px-6 h-[40px] rounded text-base font-semibold
                            cursor-pointer border-none whitespace-nowrap
                            transition-colors duration-150
                            bg-[#2196F3] text-white hover:bg-[#1e88e5]"
                        onClick={handleOffMarketSubmit}
                    >
                        <i className="pi pi-check" />
                        Confirm
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2
                            px-6 h-[40px] rounded text-base font-semibold
                            cursor-pointer border-none whitespace-nowrap
                            transition-colors duration-150
                            bg-[#D32F2F] text-white hover:bg-[#c62828]"
                        onClick={close}
                    >
                        <i className="pi pi-times" />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmOffMarketDialog.propTypes = {
    showConfirmDialog: PropTypes.bool.isRequired,
    setShowConfirmDialog: PropTypes.func.isRequired,
    handleOffMarketSubmit: PropTypes.func.isRequired,
};

export default ConfirmOffMarketDialog;
