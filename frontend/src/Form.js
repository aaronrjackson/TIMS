import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css';

function Form() {
  const navigate = useNavigate();

  const allCategories = [
    'Personnel / Human Life',
    'Environment',
    'IT Services',
    'Physical Assets',
    'Sensitive Data',
    'Operational Continuity',
    'General Security'
  ];

  const statusOptions = ['Potential', 'Active', 'Resolved'];
  const threatLevelOptions = [  // Renamed from threatLevels to threatLevelOptions
    { level: 5, label: '5 - Critical (Immediate action required)' },
    { level: 4, label: '4 - High (Address within 24 hours)' },
    { level: 3, label: '3 - Medium (Address within week)' },
    { level: 2, label: '2 - Low (Address when possible)' },
    { level: 1, label: '1 - Informational (No immediate action)' }
  ];

  const [formData, setFormData] = useState({
    username: '',
    threatname: '',
    description: '',
    status: 'Potential',
    categories: [],
    resolution: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line
  const [error, setError] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null); // Renamed from triageResult
  const [selectedThreatLevel, setSelectedThreatLevel] = useState(null); // Renamed from selectedTriage
  const [showThreatLevelModal, setShowThreatLevelModal] = useState(false); // Renamed from showTriageModal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear resolution if status changes from Resolved
      ...(name === 'status' && value !== 'Resolved' && { resolution: '' })
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter(cat => cat !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add this validation check
    if (formData.status === 'Resolved' && !formData.resolution.trim()) {
      setError('Please provide resolution details for resolved threats');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze-threat-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.threatname,
          description: formData.description,
          status: formData.status,
          categories: formData.categories
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      const [threatLevel, ...explanationParts] = result.analysis.split(' ');
      const explanation = explanationParts.join(' ').trim();

      setAiRecommendation({
        threatLevel: parseInt(threatLevel),
        explanation
      });
      setSelectedThreatLevel(parseInt(threatLevel));
      setShowThreatLevelModal(true);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmThreatLevel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Form data being submitted:", {
        name: formData.threatname,
        description: formData.description,
        status: formData.status,
        categories: formData.categories,
        threatLevel: selectedThreatLevel,
        resolution: formData.resolution
      });

      // Validate resolution for resolved threats
      if (formData.status === 'Resolved' && !formData.resolution.trim()) {
        throw new Error('Resolution details are required for resolved threats');
      }

      const response = await fetch('http://localhost:3001/api/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          name: formData.threatname,
          description: formData.description,
          status: formData.status,
          categories: formData.categories,
          threatLevel: selectedThreatLevel,
          resolution: formData.status === 'Resolved' ? formData.resolution : null,
          aiRecommendation: aiRecommendation?.threatLevel,
          aiExplanation: aiRecommendation?.explanation
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server responded with error:", errorText);
        throw new Error(errorText || 'Final submission failed');
      }

      const result = await response.json();
      console.log("Full server response:", result);

      alert(`Threat submitted successfully! ID: ${result.id}`);

      // Reset form
      setFormData({
        username: '',
        threatname: '',
        description: '',
        status: 'Potential',
        categories: [],
        resolution: ''
      });
      setAiRecommendation(null);
      setSelectedThreatLevel(null);
      setShowThreatLevelModal(false);

      // Force complete refresh - choose ONE of these options:

      // Option 1: Full page reload (most reliable)
      window.location.reload();

      // Option 2: Navigate away and back (smoother but more complex)
      // navigate('/');
      // setTimeout(() => navigate('/threats'), 50);

      // Option 3: If you have access to setRefreshThreats function:
      // setRefreshThreats(prev => !prev);

    } catch (err) {
      console.error('Complete error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="form-container">
      <div className="header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Threat Submission Form</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">

          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="threatname">Threat name:</label>
          <input
            type="text"
            id="threatname"
            name="threatname"
            value={formData.threatname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description of threat:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Threat status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {formData.status === 'Resolved' && (
          <div className="form-group">
            <label htmlFor="resolution">Resolution Details (required):</label>
            <textarea
              id="resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Explain how this threat was resolved..."
            />
          </div>
        )}

        <div className="form-group">
          <label>Categories (what is this a threat to?):</label>
          <div className="checkbox-group">
            {allCategories.map(category => (
              <div key={category} className="checkbox-option">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  value={category}
                  checked={formData.categories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={`category-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Analyzing...' : 'Submit Threat'}
        </button>
      </form>

      {/* Triage Level Modal */}
      {/* Threat Level Modal - Renamed from Triage Level Modal */}
      {showThreatLevelModal && aiRecommendation && (
        <div className="modal-overlay">
          <div className="threat-level-modal"> {/* Updated class name */}
            <h2>Threat Level Assessment</h2>

            <div className="ai-recommendation">
              <p><strong>AI Recommended Threat Level:</strong> {aiRecommendation.threatLevel}</p>
              <p><strong>Reasoning:</strong> {aiRecommendation.explanation}</p>
            </div>

            {error && (
              <div className="error-message" style={{
                color: 'red',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#ffeeee',
                border: '1px solid red',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}

            <div className="threat-level-selection"> {/* Updated class name */}
              <h3>Select Threat Level:</h3>
              <p><i>You can choose to follow the AI's recommendation, or submit your own.</i></p>
              <div className="threat-level-options"> {/* Updated class name */}
                {threatLevelOptions.map(({ level, label }) => ( // Fixed variable name
                  <div key={level} className="threat-level-option"> {/* Updated class name */}
                    <input
                      type="radio"
                      id={`threat-level-${level}`}
                      name="threatLevel"
                      value={level}
                      checked={selectedThreatLevel === level}
                      onChange={() => setSelectedThreatLevel(level)}
                    />
                    <label htmlFor={`threat-level-${level}`}>{label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowThreatLevelModal(false)}
                className="secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmThreatLevel}
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: '2px solid red', // Only keep this one
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Threat Level'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Form;