import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './GroceryRecipe.module.css';
import {FiUser, FiCompass, FiBell, FiLogOut} from "react-icons/fi";

Chart.register(...registerables);
const localizer = momentLocalizer(moment);
const API_BASE_URL = 'http://localhost:9000';

const RecipeGroceryApp = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userIdFromUrl = searchParams.get('userId') || userId || '';
  
  // State for recipes
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  
  // State for grocery items
  const [showAddGrocery, setShowAddGrocery] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [groceryItems, setGroceryItems] = useState([]);
  const [editingGroceryId, setEditingGroceryId] = useState(null);
  
  // Calendar and analytics states
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedView, setSelectedView] = useState('list'); // 'list', 'calendar', 'analytics'
  
  // Form data
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    meal_date: '',
    userId: userIdFromUrl
  });
  
  const [groceryForm, setGroceryForm] = useState({
    name: '',
    quantity: '',
    unit: '',
    brand: '',
    recipe_id: '',
    purchased: false,
    userId: userIdFromUrl
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'grocery'

  // Load initial data
  useEffect(() => {
    if (userIdFromUrl) {
      handleShowRecipes();
      handleShowGroceryList();
    }
  }, [userIdFromUrl]);

  // Common handlers
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'recipe') {
      setRecipeForm(prev => ({ ...prev, [name]: value }));
    } else {
      setGroceryForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setGroceryForm(prev => ({ ...prev, [name]: checked }));
  };

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  // Recipe handlers
  const handleAddRecipeClick = () => {
    setShowAddRecipe(true);
    setShowRecipes(false);
    setEditingRecipeId(null);
    setRecipeForm({
      title: '',
      description: '',
      prep_time: '',
      cook_time: '',
      servings: '',
      meal_date: '',
      userId: userIdFromUrl
    });
    resetMessages();
  };

  const handleShowRecipes = async () => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes?userId=${userIdFromUrl}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch recipes');
      }

      const recipes = await response.json();
      setRecipes(recipes);
      
      // Prepare calendar events
      const recipeEvents = recipes
        .filter(recipe => recipe.meal_date)
        .map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          start: new Date(recipe.meal_date),
          end: new Date(new Date(recipe.meal_date).getTime() + (recipe.prep_time + recipe.cook_time) * 60000),
          allDay: false
        }));
      
      setEvents(recipeEvents);
      setShowRecipes(true);
      setShowAddRecipe(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError(error.message || 'Failed to fetch recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editRecipe = (recipe) => {
    setShowAddRecipe(true);
    setShowRecipes(false);
    setRecipeForm({
      title: recipe.title,
      description: recipe.description,
      prep_time: recipe.prep_time.toString(),
      cook_time: recipe.cook_time.toString(),
      servings: recipe.servings.toString(),
      meal_date: recipe.meal_date || '',
      userId: recipe.user_id
    });
    setEditingRecipeId(recipe.id);
    resetMessages();
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}?userId=${userIdFromUrl}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recipe');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      handleShowRecipes(); // Refresh list
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError(error.message || 'Failed to delete recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    resetMessages();

    const payload = {
      title: recipeForm.title,
      description: recipeForm.description,
      prep_time: parseInt(recipeForm.prep_time, 10) || 0,
      cook_time: parseInt(recipeForm.cook_time, 10) || 0,
      servings: parseInt(recipeForm.servings, 10) || 1,
      meal_date: recipeForm.meal_date || null,
      user_id: userIdFromUrl
    };

    try {
      const endpoint = editingRecipeId 
        ? `${API_BASE_URL}/api/recipes/${editingRecipeId}`
        : `${API_BASE_URL}/api/recipes`;
      
      const method = editingRecipeId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save recipe');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      setRecipeForm(prev => ({
        title: '',
        description: '',
        prep_time: '',
        cook_time: '',
        servings: '',
        meal_date: '',
        userId: prev.userId
      }));
      setShowAddRecipe(false);
      setEditingRecipeId(null);
      
      // Refresh list if viewing
      if (showRecipes) {
        handleShowRecipes();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError(error.message || 'Failed to save recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Grocery handlers
  const handleAddGroceryClick = () => {
    setShowAddGrocery(true);
    setShowGroceryList(false);
    setEditingGroceryId(null);
    setGroceryForm({
      name: '',
      quantity: '',
      unit: '',
      brand: '',
      recipe_id: '',
      purchased: false,
      userId: userIdFromUrl
    });
    resetMessages();
  };

  const handleShowGroceryList = async () => {
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery?userId=${userIdFromUrl}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch grocery items');
      }

      const items = await response.json();
      setGroceryItems(items);
      setShowGroceryList(true);
      setShowAddGrocery(false);
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      setError(error.message || 'Failed to fetch grocery list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editGroceryItem = (item) => {
    setShowAddGrocery(true);
    setShowGroceryList(false);
    setGroceryForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      brand: item.brand,
      recipe_id: item.recipe_id ? item.recipe_id.toString() : '',
      purchased: item.purchased,
      userId: item.user_id
    });
    setEditingGroceryId(item.id);
    resetMessages();
  };

  const deleteGroceryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/${id}?userId=${userIdFromUrl}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      handleShowGroceryList(); // Refresh list
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      setError(error.message || 'Failed to delete item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePurchased = async (id, currentStatus) => {
    setIsLoading(true);
    resetMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/grocery/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchased: !currentStatus,
          userId: userIdFromUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      handleShowGroceryList(); // Refresh list
    } catch (error) {
      console.error('Error toggling purchased status:', error);
      setError(error.message || 'Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrocerySubmit = async (e) => {
    e.preventDefault();
    
    if (!userIdFromUrl) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    resetMessages();

    const payload = {
      name: groceryForm.name,
      quantity: groceryForm.quantity,
      unit: groceryForm.unit,
      brand: groceryForm.brand,
      recipe_id: groceryForm.recipe_id ? parseInt(groceryForm.recipe_id, 10) : null,
      purchased: groceryForm.purchased,
      user_id: userIdFromUrl
    };

    try {
      const endpoint = editingGroceryId 
        ? `${API_BASE_URL}/api/grocery/${editingGroceryId}`
        : `${API_BASE_URL}/api/grocery`;
      
      const method = editingGroceryId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save grocery item');
      }

      const result = await response.json();
      setSuccessMessage(result.message);

      // Reset form
      setGroceryForm(prev => ({
        name: '',
        quantity: '',
        unit: '',
        brand: '',
        recipe_id: '',
        purchased: false,
        userId: prev.userId
      }));
      setShowAddGrocery(false);
      setEditingGroceryId(null);
      
      // Refresh list if viewing
      if (showGroceryList) {
        handleShowGroceryList();
      }
    } catch (error) {
      console.error('Error saving grocery item:', error);
      setError(error.message || 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics data preparation
  const getRecipeAnalytics = () => {
    const data = {
      labels: recipes.map(recipe => recipe.title),
      datasets: [
        {
          label: 'Total Time (min)',
          data: recipes.map(recipe => recipe.prep_time + recipe.cook_time),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  const getGroceryAnalytics = () => {
    const purchasedCount = groceryItems.filter(item => item.purchased).length;
    const notPurchasedCount = groceryItems.length - purchasedCount;

    const data = {
      labels: ['Purchased', 'Not Purchased'],
      datasets: [
        {
          data: [purchasedCount, notPurchasedCount],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };

    return data;
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
    <div className="modern-app-container">
      <main className="app-main">
        <div className="app-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Navigation</h3>
            <button 
              className={`sidebar-btn ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipes')}
            >
              <i className="fas fa-utensils"></i> Recipes
            </button>
            <button 
              className={`sidebar-btn ${activeTab === 'grocery' ? 'active' : ''}`}
              onClick={() => setActiveTab('grocery')}
            >
              <i className="fas fa-shopping-cart"></i> Grocery List
            </button>
          </div>
          
          {activeTab === 'recipes' && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Recipe Views</h3>
              <button 
                className={`sidebar-btn ${selectedView === 'list' ? 'active' : ''}`}
                onClick={() => setSelectedView('list')}
              >
                <i className="fas fa-list"></i> List View
              </button>
              <button 
                className={`sidebar-btn ${selectedView === 'calendar' ? 'active' : ''}`}
                onClick={() => setSelectedView('calendar')}
              >
                <i className="fas fa-calendar"></i> Calendar
              </button>
              <button 
                className={`sidebar-btn ${selectedView === 'analytics' ? 'active' : ''}`}
                onClick={() => setSelectedView('analytics')}
              >
                <i className="fas fa-chart-bar"></i> Analytics
              </button>
            </div>
          )}
        </div>

        <div className="app-content">
          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className="recipes-section">
              <div className="section-header">
                <h2 className="section-title">Recipe Management</h2>
                <div className="action-buttons">
                  <button 
                    className="btn-primary"
                    onClick={handleAddRecipeClick}
                    disabled={isLoading}
                  >
                    <i className="fas fa-plus"></i> {isLoading ? 'Processing...' : 'Add Recipe'}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleShowRecipes}
                    disabled={isLoading || !userIdFromUrl}
                  >
                    <i className="fas fa-sync"></i> {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Add Recipe Form */}
              {showAddRecipe && (
                <div className="card form-card">
                  <div className="card-header">
                    <h3>{editingRecipeId ? 'Edit Recipe' : 'Add New Recipe'}</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleRecipeSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="title">Title</label>
                          <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            value={recipeForm.title}
                            onChange={(e) => handleInputChange(e, 'recipe')}
                            disabled={isLoading}
                            required
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="meal_date">Meal Date</label>
                          <input 
                            type="datetime-local" 
                            id="meal_date" 
                            name="meal_date" 
                            value={recipeForm.meal_date}
                            onChange={(e) => handleInputChange(e, 'recipe')}
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description" 
                          name="description" 
                          value={recipeForm.description}
                          onChange={(e) => handleInputChange(e, 'recipe')}
                          disabled={isLoading}
                          className="form-control"
                          rows="3"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="prep_time">Prep Time (minutes)</label>
                          <input 
                            type="number" 
                            id="prep_time" 
                            name="prep_time" 
                            value={recipeForm.prep_time}
                            onChange={(e) => handleInputChange(e, 'recipe')}
                            min="0"
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cook_time">Cook Time (minutes)</label>
                          <input 
                            type="number" 
                            id="cook_time" 
                            name="cook_time" 
                            value={recipeForm.cook_time}
                            onChange={(e) => handleInputChange(e, 'recipe')}
                            min="0"
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="servings">Servings</label>
                          <input 
                            type="number" 
                            id="servings" 
                            name="servings" 
                            value={recipeForm.servings}
                            onChange={(e) => handleInputChange(e, 'recipe')}
                            min="1"
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="submit" 
                          className="btn-primary"
                          disabled={isLoading || !userIdFromUrl}
                        >
                          <i className="fas fa-save"></i> {isLoading ? 'Saving...' : 'Save Recipe'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setShowAddRecipe(false)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Recipes Content Area */}
              {showRecipes && (
                <div className="content-area">
                  {selectedView === 'list' && (
                    <div className="card">
                      <div className="card-header">
                        <h3>Your Recipes</h3>
                      </div>
                      <div className="card-body">
                        {isLoading ? (
                          <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i> Loading recipes...
                          </div>
                        ) : recipes.length > 0 ? (
                          <div className="responsive-table">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Title</th>
                                  <th>Description</th>
                                  <th>Total Time</th>
                                  <th>Servings</th>
                                  <th>Meal Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipes.map(recipe => (
                                  <tr key={recipe.id}>
                                    <td>{recipe.title}</td>
                                    <td className="truncate">{recipe.description}</td>
                                    <td>{recipe.prep_time + recipe.cook_time} mins</td>
                                    <td>{recipe.servings}</td>
                                    <td>{recipe.meal_date ? new Date(recipe.meal_date).toLocaleString() : '-'}</td>
                                    <td className="actions">
                                      <button 
                                        className="btn-icon"
                                        onClick={() => editRecipe(recipe)}
                                        disabled={isLoading}
                                        title="Edit"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        className="btn-icon danger"
                                        onClick={() => deleteRecipe(recipe.id)}
                                        disabled={isLoading}
                                        title="Delete"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-state">
                            <i className="fas fa-utensils"></i>
                            <p>No recipes found. Add your first recipe!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedView === 'calendar' && (
                    <div className="card">
                      <div className="card-header">
                        <h3>Meal Planning Calendar</h3>
                      </div>
                      <div className="card-body">
                        <div className="calendar-container">
                          <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            onSelectEvent={event => {
                              const recipe = recipes.find(r => r.id === event.id);
                              if (recipe) editRecipe(recipe);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedView === 'analytics' && (
                    <div className="card">
                      <div className="card-header">
                        <h3>Recipe Analytics</h3>
                      </div>
                      <div className="card-body">
                        {recipes.length > 0 ? (
                          <div className="analytics-grid">
                            <div className="chart-container">
                              <h4>Recipe Time Comparison</h4>
                              <Bar 
                                data={getRecipeAnalytics()} 
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      position: 'top',
                                    },
                                  },
                                }}
                              />
                            </div>
                            <div className="stats-container">
                              <div className="stat-card">
                                <h5>Total Recipes</h5>
                                <p className="stat-value">{recipes.length}</p>
                              </div>
                              <div className="stat-card">
                                <h5>Average Prep Time</h5>
                                <p className="stat-value">
                                  {Math.round(recipes.reduce((sum, recipe) => sum + recipe.prep_time, 0) / recipes.length)} mins
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5>Average Cook Time</h5>
                                <p className="stat-value">
                                  {Math.round(recipes.reduce((sum, recipe) => sum + recipe.cook_time, 0) / recipes.length)} mins
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5>Planned Meals</h5>
                                <p className="stat-value">
                                  {recipes.filter(r => r.meal_date).length}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-state">
                            <i className="fas fa-chart-bar"></i>
                            <p>No recipe data available for analytics</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grocery Tab */}
          {activeTab === 'grocery' && (
            <div className="grocery-section">
              <div className="section-header">
                <h2 className="section-title">Grocery Management</h2>
                <div className="action-buttons">
                  <button 
                    className="btn-primary"
                    onClick={handleAddGroceryClick}
                    disabled={isLoading}
                  >
                    <i className="fas fa-plus"></i> {isLoading ? 'Processing...' : 'Add Item'}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleShowGroceryList}
                    disabled={isLoading || !userIdFromUrl}
                  >
                    <i className="fas fa-sync"></i> {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Add Grocery Form */}
              {showAddGrocery && (
                <div className="card form-card">
                  <div className="card-header">
                    <h3>{editingGroceryId ? 'Edit Item' : 'Add New Item'}</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleGrocerySubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="name">Item Name</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={groceryForm.name}
                            onChange={(e) => handleInputChange(e, 'grocery')}
                            disabled={isLoading}
                            required
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="recipe_id">Recipe ID (optional)</label>
                          <input 
                            type="number" 
                            id="recipe_id" 
                            name="recipe_id" 
                            value={groceryForm.recipe_id}
                            onChange={(e) => handleInputChange(e, 'grocery')}
                            min="1"
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="quantity">Quantity</label>
                          <input 
                            type="text" 
                            id="quantity" 
                            name="quantity" 
                            value={groceryForm.quantity}
                            onChange={(e) => handleInputChange(e, 'grocery')}
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="unit">Unit</label>
                          <input 
                            type="text" 
                            id="unit" 
                            name="unit" 
                            value={groceryForm.unit}
                            onChange={(e) => handleInputChange(e, 'grocery')}
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="brand">Brand</label>
                          <input 
                            type="text" 
                            id="brand" 
                            name="brand" 
                            value={groceryForm.brand}
                            onChange={(e) => handleInputChange(e, 'grocery')}
                            disabled={isLoading}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-check">
                        <input 
                          type="checkbox" 
                          id="purchased" 
                          name="purchased" 
                          checked={groceryForm.purchased}
                          onChange={handleCheckboxChange}
                          disabled={isLoading}
                          className="form-check-input"
                        />
                        <label htmlFor="purchased" className="form-check-label">Purchased</label>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="submit" 
                          className="btn-primary"
                          disabled={isLoading || !userIdFromUrl}
                        >
                          <i className="fas fa-save"></i> {isLoading ? 'Saving...' : 'Save Item'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setShowAddGrocery(false)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Grocery List */}
              {showGroceryList && (
                <div className="content-area">
                  <div className="card">
                    <div className="card-header">
                      <h3>Your Grocery List</h3>
                    </div>
                    <div className="card-body">
                      {isLoading ? (
                        <div className="loading-spinner">
                          <i className="fas fa-spinner fa-spin"></i> Loading grocery items...
                        </div>
                      ) : groceryItems.length > 0 ? (
                        <>
                          <div className="responsive-table">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Quantity</th>
                                  <th>Brand</th>
                                  <th>Recipe</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groceryItems.map(item => (
                                  <tr key={item.id} className={item.purchased ? 'purchased' : ''}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity} {item.unit}</td>
                                    <td>{item.brand || '-'}</td>
                                    <td>
                                      {item.recipe_id ? (
                                        recipes.find(r => r.id === item.recipe_id)?.title || `Recipe #${item.recipe_id}`
                                      ) : '-'}
                                    </td>
                                    <td>
                                      <div className="status-toggle">
                                        <label className="switch">
                                          <input
                                            type="checkbox"
                                            checked={item.purchased}
                                            onChange={() => togglePurchased(item.id, item.purchased)}
                                            disabled={isLoading}
                                          />
                                          <span className="slider round"></span>
                                        </label>
                                        <span className="status-text">
                                          {item.purchased ? 'Purchased' : 'Needed'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="actions">
                                      <button 
                                        className="btn-icon"
                                        onClick={() => editGroceryItem(item)}
                                        disabled={isLoading}
                                        title="Edit"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        className="btn-icon danger"
                                        onClick={() => deleteGroceryItem(item.id)}
                                        disabled={isLoading}
                                        title="Delete"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="analytics-section">
                            <h4>Grocery List Analytics</h4>
                            <div className="analytics-grid">
                              <div className="chart-container small">
                                <Pie 
                                  data={getGroceryAnalytics()} 
                                  options={{
                                    responsive: true,
                                    plugins: {
                                      legend: {
                                        position: 'bottom',
                                      },
                                    },
                                  }}
                                />
                              </div>
                              <div className="stats-container">
                                <div className="stat-card">
                                  <h5>Total Items</h5>
                                  <p className="stat-value">{groceryItems.length}</p>
                                </div>
                                <div className="stat-card">
                                  <h5>Purchased</h5>
                                  <p className="stat-value">
                                    {groceryItems.filter(item => item.purchased).length}
                                  </p>
                                </div>
                                <div className="stat-card">
                                  <h5>Remaining</h5>
                                  <p className="stat-value">
                                    {groceryItems.filter(item => !item.purchased).length}
                                  </p>
                                </div>
                                <div className="stat-card">
                                  <h5>% Complete</h5>
                                  <p className="stat-value">
                                    {Math.round((groceryItems.filter(item => item.purchased).length / groceryItems.length * 100))}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="empty-state">
                          <i className="fas fa-shopping-cart"></i>
                          <p>No grocery items found. Add your first item!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
    </div>
    </>
  );
};

export default RecipeGroceryApp;