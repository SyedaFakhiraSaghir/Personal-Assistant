import React, { useEffect } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

import ChatBot from "react-chatbotify";
const Home = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  console.log("User ID from localStorage:", userId);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/"); // Redirect to login
  };

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  return (
    <>
      <div className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-right">
          <button className="btns" onClick={() => navigate(`/Profile`)}>Profile</button>
          <button className="btns" onClick={() => navigate(`/explore`)}>Explore</button>
          <button className="btns" onClick={() => navigate(`/notification-reminder/?userId=${userId}`)}>N</button>
          <button className="btns" onClick={handleLogout}>Logout</button>
          <button className="btns" onClick={() => navigate(`/chatbot/?userId=${userId}`)}>chatbot</button>
            <ChatBot/>
        </div>
      </div>

      <section className="name">
        <center>
          <strong>
            <h1>RAAS</h1>
            <p>Your one-stop personal management website</p>
          </strong>
        </center>
      </section>

      <section className="container">
        <button className="btns" onClick={() => navigate(`/moodform/?userId=${userId}`)}>Mood Tracker</button>
        <button className="btns" onClick={() => navigate(`/finance-tracker/?userId=${userId}`)}>Finance Tracker</button>
        <button className="btns" onClick={() => navigate(`/health-fitness/?userId=${userId}`)}>Health Tracker</button>
        <button className="btns" onClick={() => navigate(`/book-quotes/?userId=${userId}`)}>Book and Quote Suggestions</button>
        <button className="btns" onClick={() => navigate(`/notes-schedule/?userId=${userId}`)}>Notes and Schedule</button>
        <button className="btns" onClick={() => navigate(`/recipe-grocery/?userId=${userId}`)}>Recipe Grocery</button>
      </section>

      <footer>
        <div className="footer">
          <center><p>&copy; RAAS</p></center>
        </div>
      </footer>
    </>
  );
};

export default Home;
