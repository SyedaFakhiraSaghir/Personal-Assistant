import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MotivationalApp = () => {
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
      
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          text-align: center;
          color: #2c3e50;
        }
        
        .quote-section, .preferences-section, .books-section {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        blockquote {
          font-style: italic;
          font-size: 1.2em;
          border-left: 4px solid #3498db;
          padding-left: 15px;
          margin: 20px 0;
        }
        
        footer {
          font-weight: bold;
          margin-top: 10px;
        }
        
        .preference-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        select {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          margin-top: 10px;
        }
        
        button:hover {
          background-color: #2980b9;
        }
        
        .book-list {
          list-style: none;
          padding: 0;
        }
        
        .book-item {
          background-color: white;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .error {
          color: #e74c3c;
          padding: 10px;
          background-color: #fadbd8;
          border-radius: 4px;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
};

export default MotivationalApp;