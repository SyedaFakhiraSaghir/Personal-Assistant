import React, { useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import {FiUser, FiCompass, FiBell, FiLogOut, FiMessageSquare } from "react-icons/fi";
import { FaRegSmile, FaMoneyBillWave, FaHeartbeat, FaBook, FaStickyNote, FaShoppingBasket } from "react-icons/fa";
import ChatBot from "react-chatbotify";
const Home = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  return ( 
    <>
    <header className={styles.header}>
        <a href="#default" className={styles.logo}>RAAS</a>
        <div className={styles.headerRight}>
          <button className={styles.btns} onClick={() => navigate(`/Profile`)}>
            <FiUser /> Profile
          </button>
          <button className={styles.btns} onClick={() => navigate(`/explore`)}>
            <FiCompass /> Explore
          </button>
          <button className={styles.btns} onClick={() => navigate(`/notification-reminder/?userId=${userId}`)}>
            <FiBell /> Notifications
          </button>
          <button className={styles.btns} onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
          <ChatBot></ChatBot>
        </div>
      </header>
    <div className={styles.appContainer}>
      

      <section className={styles.hero}>
        <h1>RAAS</h1>
        <p>Your one-stop personal management website</p>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard} onClick={() => navigate(`/moodform/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaRegSmile /></div>
          <h2>Mood Tracker</h2>
          <p>Track and analyze your daily emotions</p>
        </div>
        
        <div className={styles.featureCard} onClick={() => navigate(`/finance-tracker/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaMoneyBillWave /></div>
          <h2>Finance Tracker</h2>
          <p>Manage your income and expenses</p>
        </div>
        
        <div className={styles.featureCard} onClick={() => navigate(`/health-fitness/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaHeartbeat /></div>
          <h2>Health Tracker</h2>
          <p>Monitor your fitness and wellness</p>
        </div>
        
        <div className={styles.featureCard} onClick={() => navigate(`/book-quotes/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaBook /></div>
          <h2>Book & Quotes</h2>
          <p>Discover inspiring books and quotes</p>
        </div>
        
        <div className={styles.featureCard} onClick={() => navigate(`/notes-schedule/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaStickyNote /></div>
          <h2>Notes & Schedule</h2>
          <p>Organize your tasks and reminders</p>
        </div>
        
        <div className={styles.featureCard} onClick={() => navigate(`/recipe-grocery/?userId=${userId}`)}>
          <div className={styles.featureIcon}><FaShoppingBasket /></div>
          <h2>Recipe & Grocery</h2>
          <p>Plan meals and shopping lists</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} RAAS. All rights reserved.</p>
      </footer>

      <div className={styles.chatbotBtn} onClick={() => navigate(`/chatbot/?userId=${userId}`)}>
        <FiMessageSquare size={24} />
      </div>
    </div>
    </>
  );
};

export default Home;