import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ThreatEdit.css';

function ThreatEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threat, setThreat] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    description: '',
    status: 'Potential',
    level: 1,
    categories: [],
    resolution: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load threat data
  useEffect(() => {
    const fetchThreat = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/threats/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setThreat(data);
        setFormData({
          username: data.username,
          name: data.name,
          description: data.description,
          status: data.status,
          level: data.level,
          categories: data.categories || [],
          resolution: data.resolution || ''
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchThreat();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    try {
      if (formData.status === 'Resolved' && !formData.resolution.trim()) {
        throw new Error('Resolution details are required for resolved threats');
      }

      console.log("Submitting:", formData);

      const response = await fetch(`http://localhost:3001/api/threats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          username: formData.username,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          level: formData.level,
          categories: formData.categories,
          resolution: formData.status === 'Resolved' ? formData.resolution : null
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(errorText || 'Update failed');
      }

      const data = await response.json();
      console.log("Success:", data);
      navigate(`/threats/${id}`);

    } catch (error) {
      console.error("Full error:", error);
      setError(error.message || 'Failed to update threat');
    }
  };

  if (loading) return <div className="loading">Loading threat details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!threat) return <div className="error">Threat not found</div>;

  const allCategories = [
    'Personnel / Human Life',
    'Environment',
    'IT Services',
    'Physical Assets',
    'Sensitive Data',
    'Operational Continuity',
    'General Security'
  ];

  const threatLevelOptions = [
    { value: 5, label: '5 - Critical (Immediate action required)' },
    { value: 4, label: '4 - High (Address within 24 hours)' },
    { value: 3, label: '3 - Medium (Address within week)' },
    { value: 2, label: '2 - Low (Address when possible)' },
    { value: 1, label: '1 - Informational (No immediate action)' }
  ];

  return (
    <div className="threat-edit-container">
      <div className="header">
        <button onClick={() => navigate(`/threats/${id}`)} className="back-button">
          ← Back to Threat Details
        </button>
        <h1>Edit Threat: {threat.name}</h1>
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
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-form">

      <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Threat Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Potential">Potential</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
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
          <label>Threat Level:</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            {threatLevelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Categories:</label>
          <div className="categories-grid">
            {allCategories.map(category => (
              <div key={category} className="category-option">
                <input
                  type="checkbox"
                  id={`edit-cat-${category}`}
                  value={category}
                  checked={formData.categories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={`edit-cat-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/threats/${id}`)}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ThreatEdit;