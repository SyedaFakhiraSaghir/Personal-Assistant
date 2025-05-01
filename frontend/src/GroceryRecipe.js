import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { 
  ShoppingCart, 
  BookOpen, 
  List, 
  Plus, 
  RefreshCw, 
  BarChart2,
  Edit,
  Trash2,
  Save,
  X,
  Home,
  Utensils
} from 'lucide-react';
import './GroceryRecipe.module.css';

Chart.register(...registerables);
const localizer = momentLocalizer(moment);
const API_BASE_URL = 'http://localhost:9000';

const RecipeGrocery = () => {
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
  const [selectedView, setSelectedView] = useState('list');
  
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
  const [activeTab, setActiveTab] = useState('recipes');

  // Load initial data
  useEffect(() => {
    if (userId) {
      handleShowRecipes();
      handleShowGroceryList();
    }
  }, [userId]);

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
      handleShowRecipes();
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
      handleShowGroceryList();
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
      handleShowGroceryList();
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
          backgroundColor: 'rgba(110, 72, 170, 0.6)',
          borderColor: 'rgba(110, 72, 170, 1)',
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
          backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate(`/home`)}>
            <Home size={16} className="mr-2" />
            Home
          </button>
        </div>
      </header>

      <div style={{ height: '100px' }} aria-hidden="true"></div>

      <div className="main-content">
        {/* Sidebar */}

      <div style={{ height: '700px' }} aria-hidden="true"></div>
        <div className="sidebar">
          <div className="mb-3">
            <button 
              className={`btn ${activeTab === 'recipes' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('recipes')}
            >
              <Utensils size={16} className="mr-2" />
              Recipes
            </button>
            <button 
              className={`btn ${activeTab === 'grocery' ? 'btn-primary' : 'btn-secondary'} mt-2`}
              onClick={() => setActiveTab('grocery')}
            >
              <ShoppingCart size={16} className="mr-2" />
              Grocery List
            </button>
          </div>
          
          {activeTab === 'recipes' && (
            <div className="mb-3">
              <h3 className="card-title">Recipe Views</h3>
              <button 
                className={`btn ${selectedView === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedView('list')}
              >
                <List size={16} className="mr-2" />
                List View
              </button>
              
              <button 
                className={`btn ${selectedView === 'analytics' ? 'btn-primary' : 'btn-secondary'} mt-2`}
                onClick={() => setSelectedView('analytics')}
              >
                <BarChart2 size={16} className="mr-2" />
                Analytics
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          {error && (
            <div className="card mb-3" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
              <div className="card-body text-red-600">
                {error}
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="card mb-3" style={{ backgroundColor: '#dcfce7', borderColor: '#86efac' }}>
              <div className="card-body text-green-600">
                {successMessage}
              </div>
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className="recipes-section">
              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="card-title">Recipe Management</h2>
                  <div className="flex gap-2">
                    <button 
                      className="btn-primary"
                      onClick={handleAddRecipeClick}
                      disabled={isLoading}
                    >
                      <Plus size={16} className="mr-2" />
                      {isLoading ? 'Processing...' : 'Add Recipe'}
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={handleShowRecipes}
                      disabled={isLoading || !userIdFromUrl}
                    >
                      <RefreshCw size={16} className="mr-2" />
                      {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Recipe Form */}
              {showAddRecipe && (
                <div className="card form-card mb-3">
                  <div className="card-header">
                    <h3>{editingRecipeId ? 'Edit Recipe' : 'Add New Recipe'}</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleRecipeSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="title" className="form-label">Title</label>
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
                          <label htmlFor="meal_date" className="form-label">Meal Date</label>
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
                        <label htmlFor="description" className="form-label">Description</label>
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
                          <label htmlFor="prep_time" className="form-label">Prep Time (minutes)</label>
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
                          <label htmlFor="cook_time" className="form-label">Cook Time (minutes)</label>
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
                          <label htmlFor="servings" className="form-label">Servings</label>
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
                          <Save size={16} className="mr-2" />
                          {isLoading ? 'Saving...' : 'Save Recipe'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setShowAddRecipe(false)}
                          disabled={isLoading}
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Recipes Content Area */}
              {showRecipes && (
                <>
                  {selectedView === 'list' && (
                    <div className="card">
                      <div className="card-header">
                        <h3>Your Recipes</h3>
                      </div>
                      <div className="card-body">
                        {isLoading ? (
                          <div className="text-center py-4">
                            <RefreshCw size={24} className="animate-spin mx-auto" />
                            <p className="mt-2">Loading recipes...</p>
                          </div>
                        ) : recipes.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="table">
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
                                        <Edit size={16} />
                                      </button>
                                      <button 
                                        className="btn-icon danger ml-2"
                                        onClick={() => deleteRecipe(recipe.id)}
                                        disabled={isLoading}
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BookOpen size={48} className="mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-500">No recipes found. Add your first recipe!</p>
                          </div>
                        )}
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
                          <>
                            <div className="chart-container">
                              <h4 className="chart-title">Recipe Time Comparison</h4>
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
                                <h5 className="stat-title">Total Recipes</h5>
                                <p className="stat-value">{recipes.length}</p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">Average Prep Time</h5>
                                <p className="stat-value">
                                  {Math.round(recipes.reduce((sum, recipe) => sum + recipe.prep_time, 0) / recipes.length)} mins
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">Average Cook Time</h5>
                                <p className="stat-value">
                                  {Math.round(recipes.reduce((sum, recipe) => sum + recipe.cook_time, 0) / recipes.length)} mins
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">Planned Meals</h5>
                                <p className="stat-value">
                                  {recipes.filter(r => r.meal_date).length}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <BarChart2 size={48} className="mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-500">No recipe data available for analytics</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Grocery Tab */}
          {activeTab === 'grocery' && (
            
            <div className="grocery-section">
              
              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="card-title">Grocery Management</h2>
                  <div className="flex gap-2">
                    <button 
                      className="btn-primary"
                      onClick={handleAddGroceryClick}
                      disabled={isLoading}
                    >
                      <Plus size={16} className="mr-2" />
                      {isLoading ? 'Processing...' : 'Add Item'}
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={handleShowGroceryList}
                      disabled={isLoading || !userIdFromUrl}
                    >
                      <RefreshCw size={16} className="mr-2" />
                      {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
              
              

              {/* Add Grocery Form */}
              {showAddGrocery && (
                <div className="card form-card mb-3">
                  <div className="card-header">
                    <h3>{editingGroceryId ? 'Edit Item' : 'Add New Item'}</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleGrocerySubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">Item Name</label>
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
                          <label htmlFor="recipe_id" className="form-label">Recipe ID (optional)</label>
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
                          <label htmlFor="quantity" className="form-label">Quantity</label>
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
                          <label htmlFor="unit" className="form-label">Unit</label>
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
                          <label htmlFor="brand" className="form-label">Brand</label>
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
                          <Save size={16} className="mr-2" />
                          {isLoading ? 'Saving...' : 'Save Item'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setShowAddGrocery(false)}
                          disabled={isLoading}
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* Grocery List */}
              {showGroceryList && (
                <div className="card">
                  <div className="card-header">
                    <h3>Your Grocery List</h3>
                  </div>
                  <div className="card-body">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <RefreshCw size={24} className="animate-spin mx-auto" />
                        <p className="mt-2">Loading grocery items...</p>
                      </div>
                    ) : groceryItems.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="table">
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
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      className="btn-icon danger ml-2"
                                      onClick={() => deleteGroceryItem(item.id)}
                                      disabled={isLoading}
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="chart-title">Grocery List Analytics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="chart-container">
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
                                <h5 className="stat-title">Total Items</h5>
                                <p className="stat-value">{groceryItems.length}</p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">Purchased</h5>
                                <p className="stat-value">
                                  {groceryItems.filter(item => item.purchased).length}
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">Remaining</h5>
                                <p className="stat-value">
                                  {groceryItems.filter(item => !item.purchased).length}
                                </p>
                              </div>
                              <div className="stat-card">
                                <h5 className="stat-title">% Complete</h5>
                                <p className="stat-value">
                                  {Math.round((groceryItems.filter(item => item.purchased).length / groceryItems.length * 100))}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart size={48} className="mx-auto text-gray-400" />
                        <p className="mt-4 text-gray-500">No grocery items found. Add your first item!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-muted mt-6">
            © {new Date().getFullYear()} RAAS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeGrocery;