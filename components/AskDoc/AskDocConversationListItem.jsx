import { useEffect, useRef, useState } from 'react';

import {
    formatCompactDate,
    getConversationId,
    getConversationPreview,
    getConversationTimestamp,
    getConversationTitle,
} from '../../utils/askDocFormatters';

const MAX_TITLE_LENGTH = 120;

const itemClassName =
    'group rounded-[12px] border px-[12px] py-[11px] transition-colors '
    + 'focus-within:ring-2 focus-within:ring-ring ';
const selectButtonClassName =
    'min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-left '
    + 'text-foreground focus:outline-none';
const iconButtonClassName =
    'inline-flex h-[30px] w-[30px] items-center justify-center rounded-[8px] '
    + 'appearance-none border-0 bg-transparent text-muted-foreground transition-colors '
    + 'hover:bg-accent hover:text-foreground '
    + 'disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring';
const confirmButtonClassName =
    'rounded-[8px] px-[9px] py-[5px] text-[12px] font-semibold transition-colors '
    + 'appearance-none border-0 disabled:cursor-not-allowed disabled:opacity-60 '
    + 'focus:outline-none focus:ring-2 focus:ring-ring';
const subtleConfirmButtonClassName =
    `${confirmButtonClassName} bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground`;
const saveConfirmButtonClassName =
    `${confirmButtonClassName} bg-primary text-primary-foreground hover:bg-primary-hover`;
const dangerConfirmButtonClassName =
    `${confirmButtonClassName} bg-danger text-danger-foreground`;

const AskDocConversationListItem = ({
    conversation,
    selected,
    actionLoading,
    onSelect,
    onRename,
    onDelete,
}) => {
    const conversationId = getConversationId(conversation);
    const title = getConversationTitle(conversation);
    const preview = getConversationPreview(conversation);
    const timestamp = formatCompactDate(getConversationTimestamp(conversation));
    const inputRef = useRef(null);
    const editControlsRef = useRef(null);
    const [editing, setEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);
    const [validationError, setValidationError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!editing) {
            setDraftTitle(title);
        }
    }, [editing, title]);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    const startRename = () => {
        setConfirmDelete(false);
        setValidationError('');
        setDraftTitle(title);
        setEditing(true);
    };

    const cancelRename = () => {
        setEditing(false);
        setValidationError('');
        setDraftTitle(title);
    };

    const saveRename = async () => {
        const nextTitle = draftTitle.trim();

        if (!nextTitle) {
            setValidationError('Enter a chat title.');
            inputRef.current?.focus();
            return;
        }

        if (nextTitle.length > MAX_TITLE_LENGTH) {
            setValidationError(`Use ${MAX_TITLE_LENGTH} characters or fewer.`);
            inputRef.current?.focus();
            return;
        }

        if (nextTitle === title) {
            cancelRename();
            return;
        }

        const saved = await onRename(conversationId, nextTitle);
        if (saved) {
            setEditing(false);
            setValidationError('');
        }
    };

    const handleRenameSubmit = (event) => {
        event.preventDefault();
        if (!actionLoading) {
            saveRename();
        }
    };

    const handleRenameKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            cancelRename();
        }
    };

    const handleRenameBlur = (event) => {
        if (editControlsRef.current?.contains(event.relatedTarget)) return;
        cancelRename();
    };

    const handleDelete = async () => {
        const deleted = await onDelete(conversationId);
        if (deleted) {
            setConfirmDelete(false);
        }
    };

    return (
        <li
            className={
                itemClassName
                + (selected
                    ? 'border-primary/30 bg-accent text-foreground shadow-xs'
                    : 'border-transparent text-foreground hover:bg-accent')
            }
            aria-current={selected ? 'true' : undefined}
        >
            {editing ? (
                <form
                    ref={editControlsRef}
                    className="space-y-[7px]"
                    onSubmit={handleRenameSubmit}
                    onBlur={handleRenameBlur}
                >
                    <label className="sr-only" htmlFor={`ask-doc-title-${conversationId}`}>
                        Rename chat
                    </label>
                    <input
                        ref={inputRef}
                        id={`ask-doc-title-${conversationId}`}
                        className={
                            'w-full appearance-none rounded-[9px] border border-border bg-surface px-[10px] py-[8px] '
                            + 'text-[14px] font-semibold text-foreground outline-none '
                            + 'placeholder:text-foreground-muted focus:ring-2 focus:ring-ring'
                        }
                        value={draftTitle}
                        maxLength={MAX_TITLE_LENGTH}
                        onChange={(event) => {
                            setDraftTitle(event.target.value);
                            setValidationError('');
                        }}
                        onKeyDown={handleRenameKeyDown}
                        disabled={actionLoading}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-[8px]">
                        <span className="text-[11px] font-medium text-danger">
                            {validationError}
                        </span>
                        <span className="ml-auto flex items-center gap-[6px]">
                            <button
                                type="button"
                                className={subtleConfirmButtonClassName}
                                onClick={cancelRename}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={saveConfirmButtonClassName}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Saving' : 'Save'}
                            </button>
                        </span>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex min-w-0 items-start gap-[8px]">
                        <button
                            type="button"
                            className={selectButtonClassName}
                            onClick={() => onSelect(conversationId)}
                        >
                            <div className="flex min-w-0 items-start justify-between gap-[10px]">
                                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-foreground">
                                    {title}
                                </span>
                                {timestamp && (
                                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                                        {timestamp}
                                    </span>
                                )}
                            </div>
                            <p
                                className={
                                    'm-0 mt-[6px] line-clamp-2 text-[12px] leading-[1.35] '
                                    + 'text-foreground-muted'
                                }
                            >
                                {preview}
                            </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-[2px]">
                            <button
                                type="button"
                                className={iconButtonClassName}
                                onClick={startRename}
                                disabled={actionLoading}
                                aria-label={`Rename ${title}`}
                                title="Rename chat"
                            >
                                <i
                                    className={`pi ${
                                        actionLoading ? 'pi-spin pi-spinner' : 'pi-pencil'
                                    } text-[12px]`}
                                    aria-hidden="true"
                                />
                            </button>
                            <button
                                type="button"
                                className={
                                    `${iconButtonClassName} hover:bg-danger/10 hover:text-danger `
                                    + 'focus:bg-danger/10 focus:text-danger'
                                }
                                onClick={() => {
                                    setEditing(false);
                                    setConfirmDelete(true);
                                }}
                                disabled={actionLoading}
                                aria-label={`Delete ${title}`}
                                title="Delete chat"
                            >
                                <i className="pi pi-trash text-[12px]" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {confirmDelete && (
                        <div
                            className={
                                'mt-[10px] rounded-[10px] border border-danger/30 bg-danger/10 '
                                + 'px-[10px] py-[9px]'
                            }
                        >
                            <p className="m-0 text-[12px] font-medium leading-[1.35] text-foreground">
                                Delete this chat? This removes it from your Ask Doc list.
                            </p>
                            <div className="mt-[8px] flex items-center justify-end gap-[7px]">
                                <button
                                    type="button"
                                    className={subtleConfirmButtonClassName}
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={dangerConfirmButtonClassName}
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Deleting' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </li>
    );
};

export default AskDocConversationListItem;
