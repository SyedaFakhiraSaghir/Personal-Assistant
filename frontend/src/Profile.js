import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Calendar } from "react-big-calendar";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from './profile.module.css';
import { useNavigate } from "react-router-dom";

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
      setSelectedFile(null);
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

  const [moods, setMoods] = useState([]);
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    const fetchMoods = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/moods/${userId}`);
        setMoods(response.data);
      } catch (error) {
        console.error("Error fetching moods:", error);
      }
    };

    fetchMoods();
  }, [userId]);

  const events = moods.map((mood) => ({
    title: mood.mood,
    start: new Date(mood.created_at),
    end: new Date(mood.created_at),
    desc: mood.description,
  }));

  return (
    <>
      <header className={styles.header}>
        <a href="#default" className={styles.logo}>RAAS</a>
        <div className={styles.headerRight}>
          <button className={styles.btns} onClick={() => navigate(`/home`)}>
            Home
          </button>
          <button className={styles.btns} onClick={() => navigate(`/`)}>
            Login
          </button>
          <button className={styles.btns} onClick={() => navigate(`/signup`)}>
            Signup
          </button>
        </div>
      </header>

      <div className={styles["profile-page"]}>
        <div className={styles["profile-container"]}>
          <div className={styles["profile-header"]}>
            <h2>User Profile</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className={styles["edit-button"]}
              >
                Edit Profile
              </button>
            ) : (
              <div className={styles["edit-mode-actions"]}>
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
                  className={styles["cancel-button"]}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className={styles["save-button"]}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <div className={styles["profile-content"]}>
              <div className={styles["profile-picture-section"]}>
                <div className={styles["profile-picture-container"]}>
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className={styles["profile-picture"]} />
                  ) : (
                    <div className={styles["profile-picture-placeholder"]}>
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles["profile-info"]}>
                <div className={styles["info-group"]}>
                  <label>Name:</label>
                  <p>{profile.name}</p>
                </div>
                <div className={styles["info-group"]}>
                  <label>Email:</label>
                  <p>{profile.email}</p>
                </div>
                <div className={styles["info-group"]}>
                  <label>Age:</label>
                  <p>{profile.age}</p>
                </div>
                <div className={styles["info-group"]}>
                  <label>Phone Number:</label>
                  <p>{profile.phone_number}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["edit-form-overlay"]}>
              <div className={styles["profile-content"]}>
                <div className={styles["profile-picture-section"]}>
                  <div className={styles["profile-picture-container"]}>
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className={styles["profile-picture"]} />
                    ) : (
                      <div className={styles["profile-picture-placeholder"]}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles["picture-upload-controls"]}>
                    <input
                      type="file"
                      id="profile-picture-upload"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profile-picture-upload" className={styles["upload-button"]}>
                      Choose Image (PNG, JPEG)
                    </label>
                    {selectedFile && (
                      <button 
                        type="button" 
                        onClick={uploadProfilePicture}
                        className={styles["save-picture-button"]}
                      >
                        Save Picture
                      </button>
                    )}
                  </div>
                </div>
                
                <form className={styles["profile-form"]}>
                  <div className={styles["form-group"]}>
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Age:</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label>Phone Number:</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* <div className={styles["calendar-container"]}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Mood History</h2>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            className={styles["rbc-calendar"]}
          />
        </div> */}
      </div>
    </>
  );
};

export default Profile;