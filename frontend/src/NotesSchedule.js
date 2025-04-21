import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:9000';

const NotesSchedule= () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const userIdFromUrl = searchParams.get('userId') || '';
  console.log(userId);
  // State for tabs
  const [activeTab, setActiveTab] = useState('notes');
  
  // Notes state
  const [showAddNote, setShowAddNote] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    userId: userId
  });
  
  // Schedule state
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    eventName: '',
    date: '',
    time: '',
    venueOrLink: '',
    details: '',
    userId: userId
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Common handlers
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'note') {
      setNoteForm(prev => ({ ...prev, [name]: value }));
    } else {
      setEventForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Notes handlers
  const handleAddNoteClick = () => {
    setShowAddNote(true);
    setEditingNoteId(null);
    setNoteForm({
      title: '',
      description: '',
      userId: userId
    });
    setError('');
    setSuccessMessage('');
  };

  const fetchNotes = async () => {
    if (!noteForm.userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notes');
      }
      const notesData = await response.json();
      setNotes(notesData);
      setActiveTab('notes');
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error.message || 'Failed to fetch notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editNote = (note) => {
    setShowAddNote(true);
    setNoteForm({
      title: note.title,
      description: note.description,
      userId: note.userId
    });
    setEditingNoteId(note.id);
    setError('');
    setSuccessMessage('');
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}?userId=${userId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      fetchNotes(); // Refresh notes
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error.message || 'Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    
    if (!noteForm.userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = editingNoteId 
        ? `${API_BASE_URL}/api/notes/${editingNoteId}`
        : `${API_BASE_URL}/api/notes`;
      
      const method = editingNoteId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      setNoteForm({
        title: '',
        description: '',
        userId: userId
      });
      setShowAddNote(false);
      setEditingNoteId(null);
      
      // Refresh notes
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error.message || 'Failed to save note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule handlers
  const handleAddEventClick = () => {
    setShowAddEvent(true);
    setEditingEventId(null);
    setEventForm({
      eventName: '',
      date: '',
      time: '',
      venueOrLink: '',
      details: '',
      userId: userId
    });
    setError('');
    setSuccessMessage('');
  };

  const fetchEvents = async () => {
    if (!eventForm.userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/events?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      const eventsData = await response.json();
      setEvents(eventsData);
      setActiveTab('schedule');
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editEvent = (event) => {
    setShowAddEvent(true);
    setEventForm({
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      venueOrLink: event.venueOrLink,
      details: event.details,
      userId: event.userId
    });
    setEditingEventId(event.id);
    setError('');
    setSuccessMessage('');
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}?userId=${userId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventForm.userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = editingEventId 
        ? `${API_BASE_URL}/api/events/${editingEventId}`
        : `${API_BASE_URL}/api/events`;
      
      const method = editingEventId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save event');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      setEventForm({
        eventName: '',
        date: '',
        time: '',
        venueOrLink: '',
        details: '',
        userId: userId
      });
      setShowAddEvent(false);
      setEditingEventId(null);
      
      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message || 'Failed to save event. Please try again.');
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
      
      <div className="notes-schedule-container">
        <h2>Notes & Schedule Manager</h2>
        
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Notes Section */}
        {activeTab === 'notes' && (
          <div className="notes-section">
            <div className="button-group">
              <button 
                onClick={handleAddNoteClick}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Note'}
              </button>
              <button 
                onClick={fetchNotes}
                disabled={isLoading || !noteForm.userId}
              >
                {isLoading ? 'Loading...' : 'View Notes'}
              </button>
            </div>

            {/* Add Note Form */}
            <div 
              className={`add-note-container ${showAddNote ? 'show' : ''}`}
              style={{ display: showAddNote ? 'block' : 'none' }}
            >
              <form onSubmit={handleNoteSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title:</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={noteForm.title}
                    onChange={(e) => handleInputChange(e, 'note')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={noteForm.description}
                    onChange={(e) => handleInputChange(e, 'note')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !noteForm.userId}
                >
                  {isLoading ? 'Saving...' : 'Save Note'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddNote(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>

            {/* Notes List */}
            {notes.length > 0 && (
              <div className="notes-list">
                <h3>Your Notes</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(note => (
                      <tr key={note.id}>
                        <td>{note.title}</td>
                        <td>{note.description}</td>
                        <td className="actions">
                          <button 
                            onClick={() => editNote(note)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Schedule Section */}
        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <div className="button-group">
              <button 
                onClick={handleAddEventClick}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Event'}
              </button>
              <button 
                onClick={fetchEvents}
                disabled={isLoading || !eventForm.userId}
              >
                {isLoading ? 'Loading...' : 'View Schedule'}
              </button>
            </div>

            {/* Add Event Form */}
            <div 
              className={`add-event-container ${showAddEvent ? 'show' : ''}`}
              style={{ display: showAddEvent ? 'block' : 'none' }}
            >
              <form onSubmit={handleEventSubmit}>
                <div className="form-group">
                  <label htmlFor="eventName">Event Name:</label>
                  <input 
                    type="text" 
                    id="eventName" 
                    name="eventName" 
                    value={eventForm.eventName}
                    onChange={(e) => handleInputChange(e, 'event')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date" 
                    value={eventForm.date}
                    onChange={(e) => handleInputChange(e, 'event')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time:</label>
                  <input 
                    type="time" 
                    id="time" 
                    name="time" 
                    value={eventForm.time}
                    onChange={(e) => handleInputChange(e, 'event')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="venueOrLink">Venue/Meeting Link:</label>
                  <input 
                    type="text" 
                    id="venueOrLink" 
                    name="venueOrLink" 
                    value={eventForm.venueOrLink}
                    onChange={(e) => handleInputChange(e, 'event')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="details">Details:</label>
                  <textarea 
                    id="details" 
                    name="details" 
                    value={eventForm.details}
                    onChange={(e) => handleInputChange(e, 'event')}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !eventForm.userId}
                >
                  {isLoading ? 'Saving...' : 'Save Event'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddEvent(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>

            {/* Events List */}
            {events.length > 0 && (
              <div className="events-list">
                <h3>Your Schedule</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Venue/Link</th>
                      <th>Details</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td>{event.eventName}</td>
                        <td>{event.date}</td>
                        <td>{event.time}</td>
                        <td>{event.venueOrLink}</td>
                        <td>{event.details}</td>
                        <td className="actions">
                          <button 
                            onClick={() => editEvent(event)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteEvent(event.id)}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotesSchedule;