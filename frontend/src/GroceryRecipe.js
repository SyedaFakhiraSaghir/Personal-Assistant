import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GroceryRecipe.module.css';
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
  
  // Form data
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
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
      
      <div className="recipe-grocery-container">
        <h2>Recipe & Grocery Manager</h2>
        
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'grocery' ? 'active' : ''}`}
            onClick={() => setActiveTab('grocery')}
          >
            Grocery List
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="recipes-section">
            <div className="button-group">
              <button 
                onClick={handleAddRecipeClick}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Recipe'}
              </button>
              <button 
                onClick={handleShowRecipes}
                disabled={isLoading || !userIdFromUrl}
              >
                {isLoading ? 'Loading...' : 'Show Recipes'}
              </button>
            </div>

            {/* Add Recipe Form */}
            <div 
              className={`add-form-container ${showAddRecipe ? 'show' : ''}`}
              style={{ display: showAddRecipe ? 'block' : 'none' }}
            >
              <form onSubmit={handleRecipeSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title:</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={recipeForm.title}
                    onChange={(e) => handleInputChange(e, 'recipe')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description" 
                    name="description" 
                    value={recipeForm.description}
                    onChange={(e) => handleInputChange(e, 'recipe')}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prep_time">Prep Time (minutes):</label>
                  <input 
                    type="number" 
                    id="prep_time" 
                    name="prep_time" 
                    value={recipeForm.prep_time}
                    onChange={(e) => handleInputChange(e, 'recipe')}
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cook_time">Cook Time (minutes):</label>
                  <input 
                    type="number" 
                    id="cook_time" 
                    name="cook_time" 
                    value={recipeForm.cook_time}
                    onChange={(e) => handleInputChange(e, 'recipe')}
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="servings">Servings:</label>
                  <input 
                    type="number" 
                    id="servings" 
                    name="servings" 
                    value={recipeForm.servings}
                    onChange={(e) => handleInputChange(e, 'recipe')}
                    min="1"
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !userIdFromUrl}
                >
                  {isLoading ? 'Saving...' : 'Save Recipe'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddRecipe(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>

            {/* Recipes List */}
            {showRecipes && (
              <div className="list-section">
                {isLoading ? (
                  <p>Loading recipes...</p>
                ) : recipes.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Prep Time</th>
                        <th>Cook Time</th>
                        <th>Servings</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map(recipe => (
                        <tr key={recipe.id}>
                          <td>{recipe.title}</td>
                          <td>{recipe.description}</td>
                          <td>{recipe.prep_time} mins</td>
                          <td>{recipe.cook_time} mins</td>
                          <td>{recipe.servings}</td>
                          <td className="actions">
                            <button 
                              onClick={() => editRecipe(recipe)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteRecipe(recipe.id)}
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
                  <p className="no-data-message">No recipes found for this user.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Grocery Tab */}
        {activeTab === 'grocery' && (
          <div className="grocery-section">
            <div className="button-group">
              <button 
                onClick={handleAddGroceryClick}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Item'}
              </button>
              <button 
                onClick={handleShowGroceryList}
                disabled={isLoading || !userIdFromUrl}
              >
                {isLoading ? 'Loading...' : 'Show Grocery List'}
              </button>
            </div>

            {/* Add Grocery Form */}
            <div 
              className={`add-form-container ${showAddGrocery ? 'show' : ''}`}
              style={{ display: showAddGrocery ? 'block' : 'none' }}
            >
              <form onSubmit={handleGrocerySubmit}>
                <div className="form-group">
                  <label htmlFor="name">Item Name:</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={groceryForm.name}
                    onChange={(e) => handleInputChange(e, 'grocery')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity:</label>
                  <input 
                    type="text" 
                    id="quantity" 
                    name="quantity" 
                    value={groceryForm.quantity}
                    onChange={(e) => handleInputChange(e, 'grocery')}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unit:</label>
                  <input 
                    type="text" 
                    id="unit" 
                    name="unit" 
                    value={groceryForm.unit}
                    onChange={(e) => handleInputChange(e, 'grocery')}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brand">Brand:</label>
                  <input 
                    type="text" 
                    id="brand" 
                    name="brand" 
                    value={groceryForm.brand}
                    onChange={(e) => handleInputChange(e, 'grocery')}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="recipe_id">Recipe ID (optional):</label>
                  <input 
                    type="number" 
                    id="recipe_id" 
                    name="recipe_id" 
                    value={groceryForm.recipe_id}
                    onChange={(e) => handleInputChange(e, 'grocery')}
                    min="1"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group checkbox">
                  <label htmlFor="purchased">Purchased:</label>
                  <input 
                    type="checkbox" 
                    id="purchased" 
                    name="purchased" 
                    checked={groceryForm.purchased}
                    onChange={handleCheckboxChange}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !userIdFromUrl}
                >
                  {isLoading ? 'Saving...' : 'Save Item'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddGrocery(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>

            {/* Grocery List */}
            {showGroceryList && (
              <div className="list-section">
                {isLoading ? (
                  <p>Loading grocery items...</p>
                ) : groceryItems.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Brand</th>
                        <th>Recipe ID</th>
                        <th>Purchased</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groceryItems.map(item => (
                        <tr key={item.id} className={item.purchased ? 'purchased' : ''}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.brand}</td>
                          <td>{item.recipe_id || '-'}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={item.purchased}
                              onChange={() => togglePurchased(item.id, item.purchased)}
                              disabled={isLoading}
                            />
                          </td>
                          <td className="actions">
                            <button 
                              onClick={() => editGroceryItem(item)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteGroceryItem(item.id)}
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
                  <p className="no-data-message">No grocery items found for this user.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RecipeGroceryApp;