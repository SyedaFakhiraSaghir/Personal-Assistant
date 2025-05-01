import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './HealthFitness.css';

Chart.register(...registerables);

const API_BASE_URL = 'http://localhost:9000';

const HealthTracker = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userIdFromUrl = searchParams.get('userId') || '';
  
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [records, setRecords] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formData, setFormData] = useState({
    healthTips: '',
    steps: '',
    workout: '',
    waterIntake: '',
    userId: userIdFromUrl || userId
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (records.length > 0) {
      calculateStats();
    }
  }, [records]);

  const calculateStats = () => {
    const stepsData = records.map(r => r.steps);
    const waterData = records.map(r => r.waterIntake);
    const dates = records.map(r => new Date(r.createdAt).toLocaleDateString());
    
    const totalSteps = stepsData.reduce((a, b) => a + b, 0);
    const avgSteps = Math.round(totalSteps / stepsData.length);
    const maxSteps = Math.max(...stepsData);
    
    const totalWater = waterData.reduce((a, b) => a + b, 0);
    const avgWater = Math.round(totalWater / waterData.length);
    
    const workoutTypes = {};
    records.forEach(r => {
      if (r.workout) {
        workoutTypes[r.workout] = (workoutTypes[r.workout] || 0) + 1;
      }
    });
    
    setStats({
      totalSteps,
      avgSteps,
      maxSteps,
      totalWater,
      avgWater,
      workoutTypes,
      dates,
      stepsData,
      waterData
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRecordClick = () => {
    setShowAddRecord(true);
    setShowHistory(false);
    setShowAnalytics(false);
    setEditingRecordId(null);
    setFormData(prev => ({
      healthTips: '',
      steps: '',
      workout: '',
      waterIntake: '',
      userId: prev.userId
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleShowHistory = async () => {
    if (!formData.userId) {
      setError('Please enter a User ID first');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/health?userId=${formData.userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch records');
      }
  
      const records = await response.json();
      setRecords(records);
      setShowHistory(true);
      setShowAddRecord(false);
      setShowAnalytics(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.message || 'Failed to fetch history. Please try again.');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAnalytics = async () => {
    if (!formData.userId) {
        setError('Please enter a User ID first');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

        try {
        const response = await fetch(`${API_BASE_URL}/api/health?userId=${formData.userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch records');
        }
        const records = await response.json();
        setRecords(records);
        setShowAnalytics(true);
        setShowHistory(true);
        setShowAddRecord(false);
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        setError(error.message || 'Failed to fetch analytics. Please try again.');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
  };

  const editRecord = (record) => {
    setShowAddRecord(true);
    setShowHistory(false);
    setShowAnalytics(false);
    setFormData({
      healthTips: record.healthTips,
      steps: record.steps.toString(),
      workout: record.workout,
      waterIntake: record.waterIntake.toString(),
      userId: record.userId
    });
    setEditingRecordId(record.id);
    setError('');
    setSuccessMessage('');
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/health/${id}?userId=${formData.userId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete record');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      handleShowHistory(); // Refresh history
    } catch (error) {
      console.error('Error deleting record:', error);
      setError(error.message || 'Failed to delete record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWorkoutDistributionChart = () => {
    if (!stats || !stats.workoutTypes) return null;
    
    const workoutLabels = Object.keys(stats.workoutTypes);
    const workoutData = Object.values(stats.workoutTypes);
    
    const data = {
      labels: workoutLabels,
      datasets: [
        {
          label: 'Workout Types',
          data: workoutData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return <Pie data={data} />;
  };

  const renderStepsTrendChart = () => {
    if (!stats || !stats.dates || !stats.stepsData) return null;
    
    const data = {
      labels: stats.dates,
      datasets: [
        {
          label: 'Steps',
          data: stats.stepsData,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        },
      ],
    };

    return <Line data={data} />;
  };

  const renderWaterIntakeChart = () => {
    if (!stats || !stats.dates || !stats.waterData) return null;
    
    const data = {
      labels: stats.dates,
      datasets: [
        {
          label: 'Water Intake (ml)',
          data: stats.waterData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
      ],
    };

    return <Bar data={data} />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      healthTips: formData.healthTips,
      steps: parseInt(formData.steps, 10) || 0,
      workout: formData.workout,
      waterIntake: parseInt(formData.waterIntake, 10) || 0,
      userId: formData.userId
    };

    try {
      const endpoint = editingRecordId 
        ? `${API_BASE_URL}/api/health/${editingRecordId}`
        : `${API_BASE_URL}/api/health`;
      
      const method = editingRecordId ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save record');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      setFormData(prev => ({
        healthTips: '',
        steps: '',
        workout: '',
        waterIntake: '',
        userId: prev.userId
      }));
      setShowAddRecord(false);
      setEditingRecordId(null);
      
      // Refresh records
      const updatedResponse = await fetch(`${API_BASE_URL}/api/health?userId=${formData.userId}`);
      const updatedRecords = await updatedResponse.json();
      setRecords(updatedRecords);
      
    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.message || 'Failed to save record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="app-container">
        <header className="header">
          <a href="#default" className="logo">RAAS</a>
          <div className="header-actions">
            <button className="header-btn" onClick={() => navigate(`/home`)}>
              Home
            </button>
          </div>
        </header>
      </div>
      
      <div className="health-tracker-wrapper">
        <div className="health-tracker-container">
          <h2 className="tracker-title">Health & Fitness Tracker</h2>
          <div className="button-wrapper">
            <button
              className="tracker-btn"
              onClick={handleAddRecordClick}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add Record'}
            </button>
            <button
              className="tracker-btn"
              onClick={handleShowHistory}
              disabled={isLoading || !formData.userId}
            >
              {isLoading ? 'Loading...' : 'Show History'}
            </button>
            <button
              className="tracker-btn"
              onClick={handleShowAnalytics}
              disabled={isLoading}
            >
              Show Analytics
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Add Record Form */}
        {showAddRecord && (
          <div className="add-record-container">
            <form id="healthForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="healthTips">Health Tips:</label>
                <input 
                  type="text" 
                  id="healthTips" 
                  name="healthTips" 
                  value={formData.healthTips}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="steps">Steps:</label>
                <input 
                  type="number" 
                  id="steps" 
                  name="steps" 
                  value={formData.steps}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="workout">Workout:</label>
                <input 
                  type="text" 
                  id="workout" 
                  name="workout" 
                  value={formData.workout}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="waterIntake">Water Intake (ml):</label>
                <input 
                  type="number" 
                  id="waterIntake" 
                  name="waterIntake" 
                  value={formData.waterIntake}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isLoading}
                />
              </div>
              <button type="submit" disabled={isLoading || !formData.userId}>
                {isLoading ? 'Saving...' : 'Save Record'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddRecord(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* History Table */}
        {showHistory && (
          <div className="history-section">
            {isLoading ? (
              <p>Loading records...</p>
            ) : records.length > 0 ? (
              <table id="historyTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Health Tips</th>
                    <th>Steps</th>
                    <th>Workout</th>
                    <th>Water Intake</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td>{record.healthTips}</td>
                      <td>{record.steps}</td>
                      <td>{record.workout}</td>
                      <td>{record.waterIntake} ml</td>
                      <td className="actions">
                        <button onClick={() => editRecord(record)} disabled={isLoading}>
                          Edit
                        </button>
                        <button onClick={() => deleteRecord(record.id)} disabled={isLoading}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p id="noHistoryMessage">No records found for this user.</p>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {showAnalytics && stats && (
          <div className="analytics-section">
            <h3>Your Health Analytics</h3>
            
            <div className="stats-summary">
              <div className="stat-card">
                <h4>Total Steps</h4>
                <p>{stats.totalSteps}</p>
              </div>
              <div className="stat-card">
                <h4>Average Steps</h4>
                <p>{stats.avgSteps}</p>
              </div>
              <div className="stat-card">
                <h4>Max Steps</h4>
                <p>{stats.maxSteps}</p>
              </div>
              <div className="stat-card">
                <h4>Average Water Intake</h4>
                <p>{stats.avgWater} ml</p>
              </div>
            </div>
            
            <div className="chart-container">
              <h4>Steps Trend</h4>
              {renderStepsTrendChart()}
            </div>
            
            <div className="chart-container">
              <h4>Water Intake</h4>
              {renderWaterIntakeChart()}
            </div>
            
            <div className="chart-container">
              <h4>Workout Distribution</h4>
              {renderWorkoutDistributionChart()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HealthTracker;