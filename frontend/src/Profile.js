
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import styles from './profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    phone_number: '',
    profile_picture: ''
  });

  // Initialize formData with profile data
  const [formData, setFormData] = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:9000/profile/${userId}`);
        setProfile(response.data);
        // Update formData whenever profile changes
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
        setError("Failed to load profile. Please try again.");
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleEditClick = () => {
    // Ensure formData has current profile data before editing
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      age: profile.age || '',
      phone_number: profile.phone_number || ''
    });
    setIsEditing(true);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please upload a JPEG, JPG, or PNG file');
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // const uploadProfilePicture = async () => {
  //   if (!selectedFile) return;

  //   const formData = new FormData();
  //   formData.append('profile_picture', selectedFile);

  //   try {
  //     const response = await axios.put(
  //       `http://localhost:9000/profile/${userId}/picture`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       }
  //     );

  //     setProfile(prev => ({
  //       ...prev,
  //       profile_picture: response.data.profile_picture
  //     }));
  //     alert('Profile picture updated successfully!');
  //     setSelectedFile(null);
  //   } catch (error) {
  //     console.error('Error uploading profile picture:', error);
  //     alert('Failed to upload profile picture');
  //   }
  // };

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
    <>
    <div className="app-container">
      <header className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate(`/home`)}>
            Home
          </button>
        </div>
      </header>
    </div>

    <div className="profile-card">
          <div className="profile-header">
            <h2>My Profile</h2>
            {!isEditing ? (
              <button 
                onClick={handleEditClick} 
                className="edit-btn"
                disabled={isLoading}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                
                <button 
                  onClick={handleUpdateProfile}
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.profileContent}>
            <div className={styles.avatarSection}>
              {/* <div className={styles.avatarContainer}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div> */}
              
              {/* {isEditing && (
                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="avatar-upload" className={styles.uploadBtn}>
                    Change Photo
                  </label>
                  {selectedFile && (
                    <button 
                      onClick={uploadProfilePicture}
                      className={styles.savePhotoBtn}
                    >
                      Save Photo
                    </button>
                  )}
                </div>
              )} */}
            </div>
            
            {!isEditing ? (
              <div className="profile-info">
                {/* ... view mode ... */}
              </div>
            ) : (
              <form className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age} 
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number} 
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
    </>
  );
};

export default Profile;
