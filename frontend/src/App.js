// imports
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Form from './Form';
import ThreatDetail from './ThreatDetail';
import ThreatEdit from './ThreatEdit';
import ThreatCharts from './ThreatCharts';

// homepage
function Home() {
  const [activeTab, setActiveTab] = useState('unresolved');
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = activeTab === 'unresolved'
          ? 'http://localhost:3001/api/threats/unresolved'
          : activeTab === 'resolved'
            ? 'http://localhost:3001/api/threats?status=Resolved'
            : 'http://localhost:3001/api/threats';

        console.log('Fetching from:', url);
        const response = await fetch(url);

        console.log('Response status:', response.status);

        if (!response.ok) {
          // Special handling for empty unresolved threats
          if (activeTab === 'unresolved' && response.status === 404) {
            setThreats([]);
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data); // Debug what we actually received

        // Handle case where backend might return { error } instead of array
        if (data && data.error) {
          throw new Error(data.error);
        }

        setThreats(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setThreats([]);
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
          Trends & Analysis
        </button>
      </div>

      {/* tabs */}
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
                <h2>Threat Trends & Analysis</h2>
                {threats.length === 0 ? (
                  <p>No threat data available for analysis</p>
                ) : (
                  <ThreatCharts threats={threats} />
                )}
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

// routes to each "url"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
        <Route path="/threats/:id" element={<ThreatDetail />} />
        <Route path="/threats/:id/edit" element={<ThreatEdit />} />
      </Routes>
    </Router>
  );
}

export default App;