import { useState } from 'react';
import './Form.css';

function Form() {
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
  const triageLevels = [
    { level: 1, label: '1 - Critical (Immediate action required)' },
    { level: 2, label: '2 - High (Address within 24 hours)' },
    { level: 3, label: '3 - Medium (Address within week)' },
    { level: 4, label: '4 - Low (Address when possible)' },
    { level: 5, label: '5 - Informational (No immediate action)' }
  ];

  const [formData, setFormData] = useState({
    threatname: '',
    description: '',
    status: 'Potential',
    categories: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [triageResult, setTriageResult] = useState(null);
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [showTriageModal, setShowTriageModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze-threat-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      setTriageResult(result);
      setSelectedTriage(result.triageLevel); // Default to AI's recommendation
      setShowTriageModal(true);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmTriage = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.threatname,
          description: formData.description,
          status: formData.status,
          categories: formData.categories,
          triageLevel: selectedTriage,
          aiTriageRecommendation: triageResult.triageLevel,
          aiTriageExplanation: triageResult.explanation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Final submission failed');
      }

      const result = await response.json();
      alert(`Threat submitted successfully! ID: ${result.id}`);
      
      // Reset form
      setFormData({
        threatname: '',
        description: '',
        status: 'Potential',
        categories: []
      });
      setTriageResult(null);
      setSelectedTriage(null);
      setShowTriageModal(false);

    } catch (err) {
      console.error('Final submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Threat Submission Form</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
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
      {showTriageModal && (
        <div className="modal-overlay">
          <div className="triage-modal">
            <h2>Triage Level Recommendation</h2>
            
            <div className="ai-recommendation">
              <h3>AI Recommendation:</h3>
              <p><strong>Level {triageResult.triageLevel}</strong> - {triageResult.explanation}</p>
            </div>

            <div className="triage-selection">
              <h3>Select Triage Level:</h3>
              <div className="triage-options">
                {triageLevels.map(({ level, label }) => (
                  <div key={level} className="triage-option">
                    <input
                      type="radio"
                      id={`triage-${level}`}
                      name="triageLevel"
                      value={level}
                      checked={selectedTriage === level}
                      onChange={() => setSelectedTriage(level)}
                    />
                    <label htmlFor={`triage-${level}`}>{label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowTriageModal(false)}
                className="secondary"
              >
                Cancel (Edit Threat)
              </button>
              <button 
                onClick={handleConfirmTriage}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Triage Level'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Form;