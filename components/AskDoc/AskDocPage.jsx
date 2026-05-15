import { useState } from 'react';

import useAskDocConversations from '../../hooks/ask-doc/useAskDocConversations';
import AskDocChatPanel from './AskDocChatPanel';
import AskDocConversationList from './AskDocConversationList';
import AskDocErrorBanner from './AskDocErrorBanner';

const pageClassName =
    'min-h-[calc(100vh-60px)] bg-background px-[14px] py-[16px] text-foreground '
    + 'md:px-[24px] md:py-[22px]';
const newChatButtonClassName =
    'inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-primary '
    + 'px-[15px] py-[10px] text-[14px] font-semibold text-primary-foreground '
    + 'transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 '
    + 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background';
const askDocGridClassName =
    'min-[900px]:[grid-template-columns:320px_minmax(0,1fr)] '
    + 'min-[900px]:h-[calc(100vh-176px)]';

const AskDocPage = () => {
    const [composerText, setComposerText] = useState('');
    const {
        conversations,
        selectedConversation,
        selectedConversationId,
        loadingList,
        loadingConversation,
        creatingConversation,
        sendingConversationId,
        actionConversationId,
        error,
        selectConversation,
        createConversation,
        sendMessage,
        renameConversation,
        deleteConversation,
        clearError,
    } = useAskDocConversations();

    const hasSelectedConversation = Boolean(selectedConversationId);
    const sending = sendingConversationId === selectedConversationId;

    const handleNewChat = async () => {
        await createConversation();
    };

    const handlePromptClick = async (prompt) => {
        setComposerText(prompt);

        if (!selectedConversationId && !creatingConversation) {
            await createConversation();
        }
    };

    const handleSend = async () => {
        const message = composerText.trim();
        if (!message) return;

        const sent = await sendMessage(message);
        if (sent) {
            setComposerText('');
        }
    };

    return (
        <div
            className={pageClassName}
            style={{ fontFamily: 'Lato, var(--font-inter), Inter, system-ui, sans-serif' }}
        >
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[16px]">
                <div className="flex flex-wrap items-center justify-between gap-[12px]">
                    <div>
                        <h1 className="m-0 text-[26px] font-semibold leading-[1.2] text-foreground md:text-[30px]">
                            Ask Doc
                        </h1>
                        <p className="m-0 mt-[5px] text-[14px] text-foreground-muted">
                            CRM conversations for market, listing, and client questions.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={newChatButtonClassName}
                        onClick={handleNewChat}
                        disabled={creatingConversation}
                    >
                        <i
                            className={`pi ${
                                creatingConversation ? 'pi-spin pi-spinner' : 'pi-plus'
                            } text-[13px]`}
                            aria-hidden="true"
                        />
                        New Chat
                    </button>
                </div>

                <AskDocErrorBanner error={error} onDismiss={clearError} />

                <div
                    className={askDocGridClassName}
                    style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}
                >
                    <div className={hasSelectedConversation ? 'hidden min-[900px]:block' : 'block'}>
                        <AskDocConversationList
                            conversations={conversations}
                            selectedConversationId={selectedConversationId}
                            loading={loadingList}
                            creatingConversation={creatingConversation}
                            actionConversationId={actionConversationId}
                            onSelectConversation={selectConversation}
                            onRenameConversation={renameConversation}
                            onDeleteConversation={deleteConversation}
                            onNewChat={handleNewChat}
                            onPromptClick={handlePromptClick}
                        />
                    </div>
                    <div className={hasSelectedConversation ? 'block' : 'hidden min-[900px]:block'}>
                        <AskDocChatPanel
                            conversation={selectedConversation}
                            loading={loadingConversation}
                            sending={sending}
                            composerText={composerText}
                            creatingConversation={creatingConversation}
                            onComposerChange={setComposerText}
                            onSend={handleSend}
                            onBack={() => selectConversation('')}
                            onNewChat={handleNewChat}
                            onPromptClick={handlePromptClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AskDocPage;
