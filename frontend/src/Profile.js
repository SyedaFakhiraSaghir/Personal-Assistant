import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './profile.css';

const Profile = () => {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    phone_number: '',
    profile_picture: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    phone_number: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/profile/${userId}`);
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          age: response.data.age || '',
          phone_number: response.data.phone_number || ''
        });
        if (response.data.profile_picture) {
          setPreviewImage(`http://localhost:9000/${response.data.profile_picture}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please upload a JPEG, JPG, or PNG file');
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profile_picture', selectedFile);

    try {
      const response = await axios.put(
        `http://localhost:9000/profile/${userId}/picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfile(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }));
      alert('Profile picture updated successfully!');
      setSelectedFile(null); // Reset selected file after upload
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:9000/profile/${userId}`, formData);
      
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="profile-page">
      <div className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-right">
          <a className="active" href="http://localhost:3000/home">Home</a>
        </div>
      </div>
      
      <div className="profile-container">
        <div className="profile-header">
          <h2>User Profile</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-button"
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-mode-actions">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setFormData({
                    name: profile.name,
                    email: profile.email,
                    age: profile.age,
                    phone_number: profile.phone_number
                  });
                  if (profile.profile_picture) {
                    setPreviewImage(`http://localhost:9000/${profile.profile_picture}`);
                  } else {
                    setPreviewImage('');
                  }
                }}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProfile}
                className="save-button"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
        
        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="picture-upload-controls">
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profile-picture-upload" className="upload-button">
                  Choose Image (PNG, JPEG)
                </label>
                {selectedFile && (
                  <button 
                    type="button" 
                    onClick={uploadProfilePicture}
                    className="save-picture-button"
                  >
                    Save Picture
                  </button>
                )}
              </div>
            )}
          </div>
          
          <form className="profile-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={isEditing ? formData.name : profile.name}
                disabled={!isEditing}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={isEditing ? formData.email : profile.email}
                disabled={!isEditing}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={isEditing ? formData.age : profile.age}
                disabled={!isEditing}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                name="phone_number"
                value={isEditing ? formData.phone_number : profile.phone_number}
                disabled={!isEditing}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;