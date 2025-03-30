import React, { useState } from 'react';
import './AIAnalysis.css';

const AIAnalysis = ({ threats }) => {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const analyzeThreats = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/threats/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError('Failed to generate analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="ai-analysis-section">
      <h3>AI Threat Analysis</h3>
      <button 
        onClick={analyzeThreats} 
        disabled={isAnalyzing || threats.length === 0}
        className="analyze-button"
      >
        {isAnalyzing ? 'Analyzing...' : 'Generate AI Analysis'}
      </button>
      
      {analysisError && (
        <div className="analysis-error">{analysisError}</div>
      )}
      
      {aiAnalysis && (
        <div className="analysis-results">
          <h4>Analysis Results:</h4>
          <div className="analysis-text">
            {aiAnalysis.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;