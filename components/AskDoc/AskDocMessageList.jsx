import { useEffect, useRef } from 'react';

import { getConversationMessages, getMessageId } from '../../utils/askDocFormatters';
import AskDocMessageBubble from './AskDocMessageBubble';

const AskDocMessageList = ({ conversation, loading }) => {
    const messages = getConversationMessages(conversation);
    const scrollRef = useRef(null);

    useEffect(() => {
        const node = scrollRef.current;
        if (!node) return;

        node.scrollTop = node.scrollHeight;
    }, [messages.length, loading]);

    return (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-[16px] py-[18px] md:px-[24px]">
            {loading ? (
                <div className="flex h-full min-h-[260px] items-center justify-center text-foreground/60">
                    <div className="inline-flex items-center gap-[10px] text-[14px]">
                        <i className="pi pi-spin pi-spinner text-[16px]" aria-hidden="true" />
                        Loading conversation...
                    </div>
                </div>
            ) : (
                <div className="space-y-[18px]">
                    {messages.map((message) => (
                        <AskDocMessageBubble key={getMessageId(message)} message={message} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AskDocMessageList;
