import React, { useState } from 'react';
import { useLocation , useNavigate} from 'react-router-dom';
import './HealthFitness.css'; // Import the CSS file
const API_BASE_URL = 'http://localhost:9000';

const HealthTracker = () => {
const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  console.log("User ID from localStorage:", userId);

    const location = useLocation(); // 👈 get current location
    const searchParams = new URLSearchParams(location.search);
    const userIdFromUrl = searchParams.get('userId') || '';
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [records, setRecords] = useState([]);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const [formData, setFormData] = useState({
        healthTips: '',
        steps: '',
        workout: '',
        waterIntake: '',
        userId: userIdFromUrl
        
    });
  //   useEffect(() => {
  //     setFormData(prev => ({
  //         ...prev,
  //         userId: userIdFromUrl
  //     }));
  // }, [userIdFromUrl]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
        setEditingRecordId(null);
        setFormData(prev => ({
            healthTips: '',
            steps: '',
            workout: '',
            waterIntake: '',
            userId: prev.userId // Preserve the userId
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
        } catch (error) {
            console.error('Error fetching history:', error);
            setError(error.message || 'Failed to fetch history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const editRecord = (record) => {
        setShowAddRecord(true);
        setShowHistory(false);
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
                userId: prev.userId // Keep the userId
            }));
            setShowAddRecord(false);
            setEditingRecordId(null);
            
            // Refresh history if viewing
            if (showHistory) {
                handleShowHistory();
            }
        } catch (error) {
            console.error('Error saving record:', error);
            setError(error.message || 'Failed to save record. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>

  
  <div className="header">
  <a href="#default" className="logo">RAAS</a>
  <div className="header-right">
     <button className='btns' onClick={()=>navigate('/home')}>Home</button>
    <button className="btns" onClick={() => navigate(`/Profile`)}>Profile</button>
    <button className="btns" onClick={() => navigate(`/notification-reminder/?userId=${userId}`)}>N</button>
  </div>
</div>
        <div className="health-tracker-container">
            <h2>Health & Fitness Tracker</h2>
            
            <div className="button-group">
                <button 
                    id="addRecordButton" 
                    onClick={handleAddRecordClick}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Add Record'}
                </button>
                <button 
                    id="showHistoryButton" 
                    onClick={handleShowHistory}
                    disabled={isLoading || !formData.userId}
                >
                    {isLoading ? 'Loading...' : 'Show History'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {/* Add Record Form */}
            <div 
                id="addRecordContainer" 
                className={`add-record-container ${showAddRecord ? 'show' : ''}`}
                style={{ display: showAddRecord ? 'block' : 'none' }}
            >
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
                    <button 
                        type="submit" 
                        disabled={isLoading || !formData.userId}
                    >
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

            {/* History Table */}
            {showHistory && (
                <div className="history-section">
                    {isLoading ? (
                        <p>Loading records...</p>
                    ) : records.length > 0 ? (
                        <table id="historyTable">
                            <thead>
                                <tr>
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
                                        <td>{record.healthTips}</td>
                                        <td>{record.steps}</td>
                                        <td>{record.workout}</td>
                                        <td>{record.waterIntake}</td>
                                        <td className="actions">
                                            <button 
                                                onClick={() => editRecord(record)}
                                                disabled={isLoading}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => deleteRecord(record.id)}
                                                disabled={isLoading}
                                            >
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
        </div>
        </>
    );
};


export default HealthTracker;