import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BookQuotes.module.css'

const BookQuotes = () => {
  const navigate=useNavigate();
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [books, setBooks] = useState([]);
  const [preferences, setPreferences] = useState({
    genre: 'self-help',
    mood: 'motivated',
    length: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API base URL - change this to your backend URL
  const API_URL = 'http://localhost:9000/api';

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  const fetchRandomQuote = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/quotes/random`);
      setQuote(response.data.quote);
      setAuthor(response.data.author);
      setError('');
    } catch (err) {
      setError('Failed to fetch quote. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/books/suggest`, preferences);
      setBooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch book suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
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
    </div>
    <div style={{ height: '150px' }} aria-hidden="true"></div>
    <div className="container">
      <h1>Motivational Quotes & Book Suggestions</h1>
      
      <div className="quote-section">
        <h2>Today's Motivational Quote</h2>
        {loading ? (
          <p>Loading quote...</p>
        ) : (
          <>
            <blockquote>
              <p>"{quote}"</p>
              <footer>— {author}</footer>
            </blockquote>
            <button onClick={fetchRandomQuote}>Get Another Quote</button>
          </>
        )}
      </div>
      
      <div className="preferences-section">
        <h2>Set Your Preferences</h2>
        <div className="preference-group">
          <label>
            Genre:
            <select name="genre" value={preferences.genre} onChange={handlePreferenceChange}>
              <option value="self-help">Self-Help</option>
              <option value="business">Business</option>
              <option value="biography">Biography</option>
              <option value="fiction">Fiction</option>
            </select>
          </label>
        </div>
        
        <div className="preference-group">
          <label>
            Current Mood:
            <select name="mood" value={preferences.mood} onChange={handlePreferenceChange}>
              <option value="motivated">Motivated</option>
              <option value="stressed">Stressed</option>
              <option value="unfocused">Unfocused</option>
              <option value="creative">Creative</option>
            </select>
          </label>
        </div>
        
        <div className="preference-group">
          <label>
            Book Length:
            <select name="length" value={preferences.length} onChange={handlePreferenceChange}>
              <option value="short">Short (under 200 pages)</option>
              <option value="medium">Medium (200-400 pages)</option>
              <option value="long">Long (over 400 pages)</option>
            </select>
          </label>
        </div>
        
        <button onClick={fetchBookSuggestions}>Get Book Suggestions</button>
      </div>
      
      <div className="books-section">
        <h2>Recommended Books</h2>
        {loading ? (
          <p>Loading book suggestions...</p>
        ) : (
          <ul className="book-list">
            {books.map((book, index) => (
              <li key={index} className="book-item">
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
                <p>Genre: {book.genre}</p>
                <p>Why recommended: {book.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {error && <div className="error">{error}</div>}
      
      
    </div>
    </>
  );
};

export default BookQuotes;