import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), { ssr: false });

import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const formatNoteDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const AgentNotesPanel = ({ visible, onHide, delivery, leadId, isLoggedIn, onNoteCreated }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef(null);

    const headers = { Authorization: `Bearer ${isLoggedIn}` };

    useEffect(() => {
        if (visible && delivery) {
            fetchNotes();
        }
        if (!visible) {
            setNotes([]);
            setNewNote('');
        }
    }, [visible, delivery?._id]); // eslint-disable-line

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await IrgApi.get(
                `/users/dashboard/${leadId}/properties/${delivery._id}/notes`,
                { headers },
            );
            if (response.data.status === 'success') {
                setNotes(response.data.data);
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    };

    const handleSend = async () => {
        if (!newNote.trim() || sending) return;

        setSending(true);
        try {
            const response = await IrgApi.post(
                `/users/dashboard/${leadId}/properties/${delivery._id}/notes`,
                { body: newNote.trim() },
                { headers },
            );
            if (response.data.status === 'success') {
                setNotes((prev) => [...prev, response.data.data]);
                setNewNote('');
                setTimeout(scrollToBottom, 100);
                if (onNoteCreated) onNoteCreated();
            }
        } catch (error) {
            console.error('Error creating note:', error);
            showToast('error', 'Failed to send note', 'Error');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const property = delivery?.property;
    const dialogHeader = property
        ? `Notes — ${property.address}${property.unit_number ? ` #${property.unit_number}` : ''}`
        : 'Notes';

    return (
        <Dialog
            header={dialogHeader}
            visible={visible}
            onHide={onHide}
            style={{ width: '500px' }}
            modal
            draggable={false}
        >
            <div className="agent-notes">
                {/* Notes list */}
                <div className="agent-notes__list" ref={listRef}>
                    {loading ? (
                        <div className="agent-notes__empty">
                            <i className="pi pi-spin pi-spinner"></i> Loading...
                        </div>
                    ) : notes.length > 0 ? (
                        notes.map((note) => (
                            <div
                                key={note._id}
                                className={`agent-notes__note ${
                                    note.author_type === 'agent'
                                        ? 'agent-notes__note--agent'
                                        : 'agent-notes__note--user'
                                }`}
                            >
                                <div className="agent-notes__note-meta">
                                    <span className="agent-notes__note-author">{note.author_name}</span>
                                    <span className="agent-notes__note-date">{formatNoteDate(note.created_at)}</span>
                                </div>
                                <div className="agent-notes__note-body">{note.body}</div>
                            </div>
                        ))
                    ) : (
                        <div className="agent-notes__empty">No notes yet. Start the conversation.</div>
                    )}
                </div>

                {/* Input */}
                <div className="agent-notes__input">
                    <InputTextarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a note..."
                        rows={2}
                        autoResize
                        style={{ flex: 1 }}
                    />
                    <Button
                        icon="pi pi-send"
                        className="p-button-rounded p-button-info"
                        onClick={handleSend}
                        disabled={!newNote.trim() || sending}
                        loading={sending}
                    />
                </div>
            </div>
        </Dialog>
    );
};

AgentNotesPanel.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    delivery: PropTypes.object,
    leadId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.string.isRequired,
    onNoteCreated: PropTypes.func,
};

export default AgentNotesPanel;
