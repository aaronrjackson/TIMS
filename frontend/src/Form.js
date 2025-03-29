import { useState } from 'react';
import './Form.css';

function Form() {
  const allCategories = [
    'Personnel / Human Life',
    'Environment',
    'IT Services',
    'Physical Assets',
    'Sensitive Data',
  ];

  const statusOptions = ['Potential', 'Active', 'Resolved'];

  const [formData, setFormData] = useState({
    threatname: '',
    description: '',
    status: 'Potential',
    categories: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch('http://localhost:3001/api/threats', {
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
        throw new Error(errorData.message || 'Submission failed');
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

    } catch (err) {
      console.error('Submission error:', err);
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
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default Form;