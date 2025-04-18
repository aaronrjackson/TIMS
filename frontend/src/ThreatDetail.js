import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ThreatDetail.css';

function ThreatDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [threat, setThreat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // Communications tab state
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState(localStorage.getItem('chatUsername') || '');
    const messagesEndRef = useRef(null);

    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        const fetchThreat = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/threats/${id}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to fetch threat: ${response.status}`);
                }

                const data = await response.json();
                setThreat(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThreat();
    }, [id]);

    // Memoize fetchMessages and fetchLogs with useCallback
    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/threats/${id}/messages`);
            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, [id]);

    const fetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const response = await fetch(`http://localhost:3001/api/threats/${id}/logs`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.status}`);
            }
            
            const data = await response.json();
            setLogs(data);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError(err.message);
        } finally {
            setLogsLoading(false);
        }
    }, [id]);

    // Fetch messages when the communications tab is active
    useEffect(() => {
        if (activeTab === 'communications') {
            fetchMessages();
            // Set up polling for new messages every 3 seconds
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeTab, fetchMessages]);

    // Save username to localStorage when it changes
    useEffect(() => {
        if (username) {
            localStorage.setItem('chatUsername', username);
        }
    }, [username]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (activeTab === 'communications') {
            scrollToBottom();
        }
    }, [messages, activeTab]);
    
    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab, fetchLogs]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !username.trim()) return;

        try {
            const response = await fetch(`http://localhost:3001/api/threats/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: username,
                    message: newMessage
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
            }

            const data = await response.json();
            setMessages([...messages, data]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Add a formatLogDate function for the logs tab
    const formatLogDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString([], { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getThreatLevelLabel = (level) => {
        const levels = {
            1: 'Informational',
            2: 'Low',
            3: 'Medium',
            4: 'High',
            5: 'Critical'
        };
        return levels[level] || 'Unknown';
    };

    if (loading) return <div className="loading">Loading threat details...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!threat) return <div className="error">Threat not found</div>;

    return (
        <div className="threat-detail">
            <div className="header">
                <button onClick={() => navigate('/')} className="back-button">
                    ← Back to Dashboard
                </button>
                <h1>Threat: {threat.name}</h1>
            </div>

            {/* Tab Navigation*/}
            <div className="detail-tabs">
                <button
                    className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                <button
                    className={`tab ${activeTab === 'communications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('communications')}
                >
                    Communications
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Logs
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'details' && (
                    <div className="tab-pane">
                        <div className="threat-meta">
                            <div>
                                <strong>Status:</strong> {threat.status}
                            </div>
                            <div>
                                <strong>Threat Level:</strong>
                                <span className={`threat-level level-${threat.level}`}>
                                    {getThreatLevelLabel(threat.level)} (Level {threat.level})
                                </span>
                            </div>
                            <div>
                                <strong>Reported:</strong> {new Date(threat.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="section">
                            <h3>Description</h3>
                            <p>{threat.description}</p>
                        </div>

                        {threat.status === 'Resolved' && threat.resolution && (
                            <div className="section">
                                <h3>Resolution Details</h3>
                                <div className="resolution-details">
                                    <p>{threat.resolution}</p>
                                    {threat.resolved_at && (
                                        <div className="resolution-meta">
                                            <strong>Resolved on:</strong> {new Date(threat.resolved_at).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="section">
                            <h3>Categories</h3>
                            <div className="threat-categories">
                                {threat.categories.map(category => (
                                    <span key={category} className="category-tag">{category}</span>
                                ))}
                            </div>
                        </div>

                        <div className="threat-actions">
                            <button
                                onClick={() => navigate(`/threats/${id}/edit`)}
                                className="edit-button"
                            >
                                Edit Threat
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'communications' && (
                    <div className="communications-container">
                        <h3>Communications for this Threat</h3>

                        {!username ? (
                            <div className="user-info">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="user-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <button
                                    onClick={() => setUsername(username)}
                                    className="send-button"
                                >
                                    Set Name
                                </button>
                            </div>
                        ) : (
                            <div className="user-info">
                                <span>Communicating as: <strong>{username}</strong></span>
                                <button
                                    onClick={() => setUsername('')}
                                    className="edit-button"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        <div className="message-list">
                            {messages.length === 0 ? (
                                <div className="empty-messages">No messsages yet...</div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`message-item ${msg.sender === username ? 'message-user' : 'message-other'}`}
                                    >
                                        <div className="message-sender">{msg.sender}</div>
                                        <div className="message-content">{msg.message}</div>
                                        <div className="message-time">{formatTime(msg.created_at)}</div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {username && (
                            <form onSubmit={handleSendMessage} className="message-form">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="message-input"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={!username}
                                />
                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={!username || !newMessage.trim()}
                                >
                                    Send
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* In ThreatDetail.js, update the logs tab rendering */}
                {activeTab === 'logs' && (
                    <div className="tab-pane">
                        <h3>Activity Logs</h3>
                        {logsLoading ? (
                        <div className="loading">Loading logs...</div>
                        ) : logs.length === 0 ? (
                        <div className="empty-logs">No activity logs yet</div>
                        ) : (
                        <div className="log-list">
                            {logs.map((log) => (
                            <div key={log.id} className="log-item">
                                <div className="log-header">
                                <span className="log-action">{log.action}</span>
                                <span className="log-user">by {log.user}</span>
                                <span className="log-time">{formatLogDate(log.created_at)}</span>
                                </div>
                                {log.details && (
                                <div className="log-details">
                                    {log.details}
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThreatDetail;