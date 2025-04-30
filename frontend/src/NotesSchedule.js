import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faHeartbeat} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:9000';

const NotesSchedule = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
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
      userId: userId // Make sure to include the current userId
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
      console.log(`Deleting note ${id} for user ${userId}`); // Debug log
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}?userId=${userId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Delete response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }
  
      const result = await response.json();
      console.log('Delete result:', result); // Debug log
      setSuccessMessage(result.message);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error.message || 'Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError('User ID is required');
      return;
    }
    
    // Validate required fields
    if (!noteForm.title.trim() || !noteForm.description.trim()) {
      setError('Title and description are required');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
  
    try {
      const endpoint = editingNoteId 
        ? `${API_BASE_URL}/api/notes/${editingNoteId}?userId=${userId}`
        : `${API_BASE_URL}/api/notes?userId=${userId}`;
      
      const method = editingNoteId ? 'PUT' : 'POST';
  
      // Create the request body - same structure for both POST and PUT
      const requestBody = {
        title: noteForm.title,
        description: noteForm.description
      };
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note');
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
      
      // Refresh notes list
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/events?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      const eventsData = await response.json();
      console.log('Fetched events:', eventsData); // Debug log
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
      eventName: event.event_name || event.eventName, // Handle both cases
      date: event.date,
      time: event.time,
      venueOrLink: event.venue_or_link || event.venueOrLink, // Handle both cases
      details: event.details || '',
      userId: userId
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
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError('User ID is required');
      return;
    }
  
    // Validate required fields
    if (!eventForm.eventName || !eventForm.date || !eventForm.time || !eventForm.venueOrLink) {
      setError('Event name, date, time, and venue/link are required');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
  
    try {
      const endpoint = editingEventId 
        ? `${API_BASE_URL}/api/events/${editingEventId}?userId=${userId}`
        : `${API_BASE_URL}/api/events?userId=${userId}`;
      
      const method = editingEventId ? 'PUT' : 'POST';
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: eventForm.eventName,
          date: eventForm.date,
          time: eventForm.time,
          venueOrLink: eventForm.venueOrLink,
          details: eventForm.details || '' // Handle optional details
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
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
      
      // Refresh events list
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
    <div className="app-container">
    {/* Header */}
    <header className="header">
      <a href="#default" className="logo">RAAS</a>
      <div className="header-actions">
        <button className="header-btn" onClick={() => navigate(`/home`)}>
          Home
        </button>
      </div>
    </header>
    <div style={{ backgroundColor: '#e2f1e7', minHeight: '100vh' }}>
      

      <header className="hero py-5" style={{
        textAlign: 'center',
        padding: '100px 0',
        backgroundImage: 'url("https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white'
      }}>
        <div className="container text-center">
          <h1 className="display-4 mb-4">Never Miss a Deadline Again</h1>
          <p className="lead mb-4">
            ReminderHub helps you stay on top of your notes and events with timely reminders.
          </p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card feature-card h-100" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                <div className="card-body text-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="fa-3x mb-3" style={{ color: '#629584' }} />
                  <h3 className="card-title">Notes</h3>
                  <p className="card-text">
                    Keep track of important information, ideas, and thoughts.
                  </p>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={() => setActiveTab('notes')}
                  >
                    View Notes
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card feature-card h-100" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                <div className="card-body text-center">
                  <FontAwesomeIcon icon={faHeartbeat} className="fa-3x mb-3" style={{ color: '#629584' }} />
                  <h3 className="card-title">Schedule</h3>
                  <p className="card-text">
                    Manage your events, appointments, and important dates.
                  </p>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={() => setActiveTab('schedule')}
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      {successMessage && (
        <div className="container">
          <div className="alert alert-success">{successMessage}</div>
        </div>
      )}

      {/* Notes Section */}
      {activeTab === 'notes' && (
        <section id="add-reminder" className="py-5 bg-light">
          <div className="container">
            <h2 className="text-center mb-4">Notes Manager</h2>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="d-flex justify-content-between mb-4">
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={handleAddNoteClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Add Note'}
                  </button>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={fetchNotes}
                    disabled={isLoading || !noteForm.userId}
                  >
                    {isLoading ? 'Loading...' : 'Refresh Notes'}
                  </button>
                </div>

                {showAddNote && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <form onSubmit={handleNoteSubmit}>
                        <div className="mb-3">
                          <label htmlFor="title" className="form-label">Title:</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="title" 
                            name="title" 
                            value={noteForm.title}
                            onChange={(e) => handleInputChange(e, 'note')}
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="description" className="form-label">Description:</label>
                          <textarea 
                            className="form-control" 
                            id="description" 
                            name="description" 
                            value={noteForm.description}
                            onChange={(e) => handleInputChange(e, 'note')}
                            disabled={isLoading}
                            required
                            rows="5"
                          />
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setShowAddNote(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn" 
                            style={{ backgroundColor: '#629584', color: 'white' }}
                            disabled={isLoading || !noteForm.userId}
                          >
                            {isLoading ? 'Saving...' : 'Save Note'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {notes.length > 0 && (
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h3 className="text-center mb-4">Your Notes</h3>
                      <div className="table-responsive">
                        <table className="table">
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
                                <td>
                                  <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => editNote(note)}
                                    disabled={isLoading}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      {activeTab === 'schedule' && (
        <section id="upcoming" className="py-5">
          <div className="container">
            <h2 className="text-center mb-4">Schedule Manager</h2>
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="d-flex justify-content-between mb-4">
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={handleAddEventClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Add Event'}
                  </button>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#629584', color: 'white' }}
                    onClick={fetchEvents}
                    disabled={isLoading || !eventForm.userId}
                  >
                    {isLoading ? 'Loading...' : 'Refresh Events'}
                  </button>
                </div>

                {showAddEvent && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <form onSubmit={handleEventSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="eventName" className="form-label">Event Name:</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="eventName" 
                              name="eventName" 
                              value={eventForm.eventName}
                              onChange={(e) => handleInputChange(e, 'event')}
                              disabled={isLoading}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="venueOrLink" className="form-label">Venue/Meeting Link:</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              id="venueOrLink" 
                              name="venueOrLink" 
                              value={eventForm.venueOrLink}
                              onChange={(e) => handleInputChange(e, 'event')}
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="date" className="form-label">Date:</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              id="date" 
                              name="date" 
                              value={eventForm.date}
                              onChange={(e) => handleInputChange(e, 'event')}
                              disabled={isLoading}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="time" className="form-label">Time:</label>
                            <input 
                              type="time" 
                              className="form-control" 
                              id="time" 
                              name="time" 
                              value={eventForm.time}
                              onChange={(e) => handleInputChange(e, 'event')}
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="details" className="form-label">Details:</label>
                          <textarea 
                            className="form-control" 
                            id="details" 
                            name="details" 
                            value={eventForm.details}
                            onChange={(e) => handleInputChange(e, 'event')}
                            disabled={isLoading}
                            rows="3"
                          />
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setShowAddEvent(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn" 
                            style={{ backgroundColor: '#629584', color: 'white' }}
                            disabled={isLoading || !eventForm.userId}
                          >
                            {isLoading ? 'Saving...' : 'Save Event'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {events.length > 0 && (
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h3 className="text-center mb-4">Your Events</h3>
                      <div className="table-responsive">
                        <table className="table">
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
                                <td>{event.eventName || event.event_name}</td>
                                <td>{event.date}</td>
                                <td>{event.time}</td>
                                <td>{event.venueOrLink || event.venue_or_link}</td>
                                <td>{event.details}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => editEvent(event)}
                                    disabled={isLoading}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-dark text-white text-center py-3">
        <div className="container">
          <p className="mb-0">&copy; 2024 ReminderHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </div>
    </>
  );
};

export default NotesSchedule;