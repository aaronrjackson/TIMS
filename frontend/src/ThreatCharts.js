import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './ThreatCharts.css';

ChartJS.register(...registerables);

const ThreatCharts = ({ threats }) => {
  // Prepare data for charts
  const threatLevels = [0, 0, 0, 0, 0]; // For levels 1-5
  const categoryCounts = {};
  const monthlyCounts = {};
  
  // Process threat data
  threats.forEach(threat => {
    // Count threat levels
    if (threat.level >= 1 && threat.level <= 5) {
      threatLevels[threat.level - 1]++;
    }
    
    // Count categories
    threat.categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Count by month
    const date = new Date(threat.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
  });
  
  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories
  
  // Sort months chronologically
  const sortedMonths = Object.entries(monthlyCounts)
    .sort((a, b) => {
      const [aMonth, aYear] = a[0].split('/').map(Number);
      const [bMonth, bYear] = b[0].split('/').map(Number);
      return aYear - bYear || aMonth - bMonth;
    });
  
  // Chart data configurations
  const levelData = {
    labels: ['Informational', 'Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      label: 'Threats by Severity Level',
      data: threatLevels,
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const categoryData = {
    labels: sortedCategories.map(item => item[0]),
    datasets: [{
      label: 'Top Threat Categories',
      data: sortedCategories.map(item => item[1]),
      backgroundColor: [
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const trendData = {
    labels: sortedMonths.map(item => item[0]),
    datasets: [{
      label: 'Threats Over Time',
      data: sortedMonths.map(item => item[1]),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.1
    }]
  };
  
  return (
    <div className="charts-container">
      <div className="chart-row">
        <div className="chart-container">
          <h3>Threat Severity Distribution</h3>
          <Bar 
            data={levelData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Threats'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Threat Level'
                  }
                }
              }
            }} 
          />
        </div>
        <div className="chart-container">
          <h3>Top Threat Categories</h3>
          <Pie 
            data={categoryData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
              }
            }} 
          />
        </div>
      </div>
      <div className="chart-row">
        <div className="chart-container">
          <h3>Threats Over Time</h3>
          <Line 
            data={trendData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Threats'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Month/Year'
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ThreatCharts;