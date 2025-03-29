import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ThreatDetail.css';

function ThreatDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [threat, setThreat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

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

            {/* Tab Navigation - REMOVE BUTTON FROM HERE */}
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

            {/* Tab Content */}
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

                        <div className="section">
                            <h3>Categories</h3>
                            <div className="threat-categories">
                                {threat.categories.map(category => (
                                    <span key={category} className="category-tag">{category}</span>
                                ))}
                            </div>
                        </div>

                        {/* New Resolution Section */}
                        {threat.status === 'Resolved' && threat.resolution && (
                            <div className="section">
                                <h3>Resolution Details</h3>
                                <p className="resolution-text">{threat.resolution}</p>
                            </div>
                        )}

                        <div className="threat-actions">
                            <button
                                onClick={() => navigate(`/threats/${id}/edit`)}
                                className="edit-button"
                                style={{
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginTop: '20px'
                                }}
                            >
                                Edit Threat
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'communications' && (
                    <div className="tab-pane">
                        <h3>Communications</h3>
                        <p>All related communications will appear here.</p>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="tab-pane">
                        <h3>Activity Logs</h3>
                        <p>All activity logs will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThreatDetail;