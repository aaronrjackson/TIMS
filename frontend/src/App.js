import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Form from './Form';
import ThreatDetail from './ThreatDetail';

function Home() {
  const [activeTab, setActiveTab] = useState('unresolved');
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        let status = null;

        if (activeTab === 'unresolved') {
          status = 'Active';
        } else if (activeTab === 'resolved') {
          status = 'Resolved';
        }

        const url = status
          ? `http://localhost:3001/api/threats?status=${status}`
          : 'http://localhost:3001/api/threats';

        console.log('Fetching from:', url); // Add this line

        const response = await fetch(url);

        console.log('Response status:', response.status); // Add this line

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText); // Add this line
          throw new Error(`Failed to fetch threats: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data); // Add this line
        setThreats(data);
      } catch (err) {
        console.error('Fetch error:', err); // Enhanced error logging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, [activeTab]);

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

  return (
    <div className="homepage">
      <div className="header">
        <h1>Threat Monitoring Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'unresolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('unresolved')}
        >
          Unresolved Threats
        </button>
        <button
          className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          Resolved Threats
        </button>
        <button
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {loading ? (
          <div className="loading">Loading threats...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <>
            {activeTab === 'unresolved' && (
              <div className="tab-pane">
                <h2>Unresolved Threats</h2>
                {threats.length === 0 ? (
                  <p>No unresolved threats found</p>
                ) : (
                  <div className="threats-list">
                    {threats.map(threat => (
                      <Link
                        to={`/threats/${threat.id}`}
                        key={threat.id}
                        className="threat-card-link"
                      >
                        <div className="threat-card">
                          {/* Keep all existing card content exactly as-is */}
                          <div className="threat-header">
                            <h3>{threat.name}</h3>
                            <span className={`threat-level level-${threat.level}`}>
                              {getThreatLevelLabel(threat.level)}
                            </span>
                          </div>
                          <p className="threat-description">{threat.description}</p>
                          <div className="threat-details">
                            <span>Status: {threat.status}</span>
                            <span>Reported: {new Date(threat.created_at).toLocaleString()}</span>
                          </div>
                          <div className="threat-categories">
                            {threat.categories.map(category => (
                              <span key={category} className="category-tag">{category}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resolved' && (
              <div className="tab-pane">
                <h2>Resolved Threats</h2>
                {threats.length === 0 ? (
                  <p>No resolved threats found</p>
                ) : (
                  <div className="threats-list">
                    {threats.map(threat => (
                      <Link
                        to={`/threats/${threat.id}`}
                        key={threat.id}
                        className="threat-card-link"
                      >
                        <div className="threat-card">
                          {/* Keep all existing card content exactly as-is */}
                          <div className="threat-header">
                            <h3>{threat.name}</h3>
                            <span className={`threat-level level-${threat.level}`}>
                              {getThreatLevelLabel(threat.level)}
                            </span>
                          </div>
                          <p className="threat-description">{threat.description}</p>
                          <div className="threat-details">
                            <span>Status: {threat.status}</span>
                            <span>Reported: {new Date(threat.created_at).toLocaleString()}</span>
                          </div>
                          <div className="threat-categories">
                            {threat.categories.map(category => (
                              <span key={category} className="category-tag">{category}</span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="tab-pane">
                <h2>Threat Trends</h2>
                <p>Analytics and patterns will appear here</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="actions">
        <Link to="/form" className="cta-button">Report New Threat</Link>
      </div>
    </div>
  );
}

// all our different pages
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
        <Route path="/threats/:id" element={<ThreatDetail />} />
      </Routes>
    </Router>
  );
}

export default App;