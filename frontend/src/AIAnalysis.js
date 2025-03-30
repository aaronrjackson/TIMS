import React, { useState } from 'react';
import './AIAnalysis.css';

const AIAnalysis = ({ threats }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const analyzeThreats = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/threats/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // First check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned unexpected format: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Validate the analysis structure
      if (!data.analysis || 
          !data.analysis.patterns || 
          !data.analysis.recurringThreats || 
          !data.analysis.summary) {
        throw new Error('Invalid analysis format received');
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Failed to generate analysis. Please try again.');
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
          <h2>Security Assessment</h2>

          <div className="analysis-section">
            <h4>Patterns Detected</h4>
            <ul>
              {aiAnalysis.patterns.map((pattern, i) => (
                <li key={i}>{pattern}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h4>Recurring Threats</h4>
            <ul>
              {aiAnalysis.recurringThreats.map((threat, i) => (
                <li key={i}>{threat}</li>
              ))}
            </ul>
          </div>

          {aiAnalysis.anomalies.length > 0 && (
            <div className="analysis-section">
              <h4>Notable Anomalies</h4>
              <ul>
                {aiAnalysis.anomalies.map((anomaly, i) => (
                  <li key={i}>{anomaly}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="analysis-section">
            <h4>Summary</h4>
            <p>{aiAnalysis.summary}</p>
          </div>

          {aiAnalysis.recommendations.length > 0 && (
            <div className="analysis-section recommendations">
              <h4>Recommended Actions</h4>
              <ol>
                {aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;