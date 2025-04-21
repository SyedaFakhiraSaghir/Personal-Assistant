import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:9000';

const BookQuoteTracker = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userIdFromUrl = searchParams.get('userId') || '';
  
  // State for UI control
  const [activeTab, setActiveTab] = useState('books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    userId: userIdFromUrl
  });
  
  const [quoteForm, setQuoteForm] = useState({
    text: '',
    author: '',
    category: '',
    source: '',
    userId: userIdFromUrl
  });
  
  const [noteForm, setNoteForm] = useState({
    content: '',
    itemId: '',
    itemType: ''
  });

  // Fetch genres and categories on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [genresRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books/genres`),
          fetch(`${API_BASE_URL}/api/quotes/categories`)
        ]);
        
        const genresData = await genresRes.json();
        const categoriesData = await categoriesRes.json();
        
        setGenres(genresData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    
    fetchMetadata();
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowAddForm(false);
    setShowFavorites(false);
    setError('');
    setSuccessMessage('');
  };

  // Handle input changes
  const handleBookInputChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setNoteForm(prev => ({ ...prev, [name]: value }));
  };

  // Fetch books or quotes
  const fetchItems = async () => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = activeTab === 'books' 
        ? `${API_BASE_URL}/api/books?userId=${userIdFromUrl}&search=${searchQuery}`
        : `${API_BASE_URL}/api/quotes?userId=${userIdFromUrl}&search=${searchQuery}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch items');
      }

      const data = await response.json();
      
      if (activeTab === 'books') {
        setBooks(data);
      } else {
        setQuotes(data);
      }
      
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error.message || 'Failed to fetch items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites?userId=${userIdFromUrl}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data);
      setShowFavorites(true);
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message || 'Failed to fetch favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new book or quote
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = activeTab === 'books' 
        ? `${API_BASE_URL}/api/books`
        : `${API_BASE_URL}/api/quotes`;
      
      const method = 'POST';
      const payload = activeTab === 'books' ? bookForm : quoteForm;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      if (activeTab === 'books') {
        setBookForm({
          title: '',
          author: '',
          genre: '',
          description: '',
          userId: userIdFromUrl
        });
      } else {
        setQuoteForm({
          text: '',
          author: '',
          category: '',
          source: '',
          userId: userIdFromUrl
        });
      }
      
      // Refresh items
      fetchItems();
      
    } catch (error) {
      console.error('Error saving item:', error);
      setError(error.message || 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (itemId, itemType) => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdFromUrl,
          itemId,
          itemType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to favorites');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      
      // Refresh favorites if viewing
      if (showFavorites) {
        fetchFavorites();
      }
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setError(error.message || 'Failed to add to favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (favoriteId) => {
    if (!window.confirm('Are you sure you want to remove this from favorites?')) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/${favoriteId}?userId=${userIdFromUrl}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from favorites');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      
      // Refresh favorites
      fetchFavorites();
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError(error.message || 'Failed to remove from favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add note to item
  const addNote = async (e) => {
    e.preventDefault();
    
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noteForm,
          userId: userIdFromUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      
      // Reset note form
      setNoteForm({
        content: '',
        itemId: '',
        itemType: ''
      });
      
      // Refresh items
      fetchItems();
      
    } catch (error) {
      console.error('Error adding note:', error);
      setError(error.message || 'Failed to add note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get suggestions based on NLP analysis
  const getSuggestions = async () => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = activeTab === 'books' 
        ? `${API_BASE_URL}/api/books/suggestions?userId=${userIdFromUrl}`
        : `${API_BASE_URL}/api/quotes/suggestions?userId=${userIdFromUrl}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get suggestions');
      }

      const data = await response.json();
      
      if (activeTab === 'books') {
        setBooks(data);
      } else {
        setQuotes(data);
      }
      
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setError(error.message || 'Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-right">
          <button className='btns' onClick={() => navigate('/home')}>Home</button>
          <button className="btns" onClick={() => navigate(`/Profile`)}>Profile</button>
          <button className="btns" onClick={() => navigate(`/notification-reminder/?userId=${userId}`)}>N</button>
        </div>
      </div>
      
      <div className="book-quote-container">
        <h2>Book & Quote Tracker</h2>
        
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => handleTabChange('books')}
          >
            Books
          </button>
          <button 
            className={`tab ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => handleTabChange('quotes')}
          >
            Quotes
          </button>
        </div>
        
        {/* Search and action buttons */}
        <div className="action-bar">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={fetchItems} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button onClick={() => setShowAddForm(true)} disabled={isLoading || showAddForm}>
            Add {activeTab.slice(0, -1)}
          </button>
          <button onClick={fetchFavorites} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'My Favorites'}
          </button>
          <button onClick={getSuggestions} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Add Form */}
        {showAddForm && (
          <div className="add-form">
            <h3>Add New {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleAddItem}>
              {activeTab === 'books' ? (
                <>
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      name="title"
                      value={bookForm.title}
                      onChange={handleBookInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author:</label>
                    <input
                      type="text"
                      name="author"
                      value={bookForm.author}
                      onChange={handleBookInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Genre:</label>
                    <select
                      name="genre"
                      value={bookForm.genre}
                      onChange={handleBookInputChange}
                      required
                    >
                      <option value="">Select Genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={bookForm.description}
                      onChange={handleBookInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Quote Text:</label>
                    <textarea
                      name="text"
                      value={quoteForm.text}
                      onChange={handleQuoteInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author:</label>
                    <input
                      type="text"
                      name="author"
                      value={quoteForm.author}
                      onChange={handleQuoteInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      name="category"
                      value={quoteForm.category}
                      onChange={handleQuoteInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Source:</label>
                    <input
                      type="text"
                      name="source"
                      value={quoteForm.source}
                      onChange={handleQuoteInputChange}
                    />
                  </div>
                </>
              )}
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Items List */}
        {!showAddForm && !showFavorites && (
          <div className="items-list">
            {isLoading ? (
              <p>Loading {activeTab}...</p>
            ) : activeTab === 'books' ? (
              books.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Genre</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book._id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>{book.description}</td>
                        <td className="actions">
                          <button onClick={() => addToFavorites(book._id, 'book')}>
                            Favorite
                          </button>
                          <button onClick={() => {
                            setNoteForm({
                              content: '',
                              itemId: book._id,
                              itemType: 'book'
                            });
                            document.getElementById('note-modal').style.display = 'block';
                          }}>
                            Add Note
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No books found. Try adding some or getting suggestions.</p>
              )
            ) : (
              quotes.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Quote</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(quote => (
                      <tr key={quote._id}>
                        <td>{quote.text}</td>
                        <td>{quote.author}</td>
                        <td>{quote.category}</td>
                        <td>{quote.source}</td>
                        <td className="actions">
                          <button onClick={() => addToFavorites(quote._id, 'quote')}>
                            Favorite
                          </button>
                          <button onClick={() => {
                            setNoteForm({
                              content: '',
                              itemId: quote._id,
                              itemType: 'quote'
                            });
                            document.getElementById('note-modal').style.display = 'block';
                          }}>
                            Add Note
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No quotes found. Try adding some or getting suggestions.</p>
              )
            )}
          </div>
        )}

        {/* Favorites List */}
        {showFavorites && (
          <div className="favorites-list">
            {isLoading ? (
              <p>Loading favorites...</p>
            ) : favorites.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Content</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map(fav => (
                    <tr key={fav._id}>
                      <td>{fav.itemType}</td>
                      <td>
                        {fav.itemType === 'book' ? (
                          <>
                            <strong>{fav.item.title}</strong> by {fav.item.author}
                            {fav.notes && fav.notes.length > 0 && (
                              <div className="notes">
                                <strong>Notes:</strong>
                                <ul>
                                  {fav.notes.map(note => (
                                    <li key={note._id}>{note.content}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            "{fav.item.text}" - {fav.item.author}
                            {fav.notes && fav.notes.length > 0 && (
                              <div className="notes">
                                <strong>Notes:</strong>
                                <ul>
                                  {fav.notes.map(note => (
                                    <li key={note._id}>{note.content}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="actions">
                        <button onClick={() => removeFromFavorites(fav._id)}>
                          Remove
                        </button>
                        <button onClick={() => {
                          setNoteForm({
                            content: '',
                            itemId: fav.item._id,
                            itemType: fav.itemType
                          });
                          document.getElementById('note-modal').style.display = 'block';
                        }}>
                          Add Note
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No favorites found. Add some items to your favorites!</p>
            )}
          </div>
        )}

        {/* Note Modal */}
        <div id="note-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => document.getElementById('note-modal').style.display = 'none'}>
              &times;
            </span>
            <h3>Add Note</h3>
            <form onSubmit={addNote}>
              <textarea
                name="content"
                value={noteForm.content}
                onChange={handleNoteInputChange}
                placeholder="Enter your notes here..."
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Note'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookQuoteTracker;