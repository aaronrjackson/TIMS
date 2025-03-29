import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Form from './Form';

function Home() {
  const [activeTab, setActiveTab] = useState('unresolved');

  return (
    <div className="homepage">

      <div className="header">
        <h1>Threat Monitoring System</h1>
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
        {activeTab === 'unresolved' && (
          <div className="tab-pane">
            <h2>Unresolved Threats</h2>
            <p>List of active threats will appear here</p>
          </div>
        )}
        
        {activeTab === 'resolved' && (
          <div className="tab-pane">
            <h2>Resolved Threats</h2>
            <p>History of resolved cases will appear here</p>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div className="tab-pane">
            <h2>Threat Trends</h2>
            <p>Analytics and patterns will appear here</p>
          </div>
        )}
      </div>

      <div className="actions">
        <Link to="/form" className="cta-button">Report New Threat</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App;