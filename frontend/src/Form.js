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

  const statusOptions = [
    'Potential',
    'Active',
    'Resolved'
  ];

  const [formData, setFormData] = useState({
    threatname: '',
    description: '',
    status: 'Potential', // Added status to initial state
    categories: [] // For checkbox selections
  });


  // Handle text/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories, value]
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(cat => cat !== value)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Form submitted successfully!');
        setFormData({ 
          threatname: '', 
          description: '', 
          status: 'Potential',
          categories: []
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    }
  };

  return (
    <div className="form-container">
      <h1>Threat Submission Form</h1>
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
        
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Form;