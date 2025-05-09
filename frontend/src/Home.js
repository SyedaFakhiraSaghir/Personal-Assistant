import React, { useEffect, useState} from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiCompass,
  FiLogOut,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";
import {
  FaRegSmile,
  FaMoneyBillWave,
  FaHeartbeat,
  FaBook,
  FaStickyNote,
  FaShoppingBasket,
} from "react-icons/fa";
import ChatBot from "react-chatbotify";
import { notifyInfo } from "./NotificationService";

const Home = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [tipsEnabled, setTipsEnabled] = useState(false);

  const moduleTips = {
    finance: [
      "💰 Check weekly budget balance",
      "💳 Review recent transactions",
      "📈 Set monthly savings goal",
      "🧾 Track daily expenses",
      "🤑 Pay credit card bills",
      "📊 Analyze spending patterns",
      "🛑 Avoid impulse purchases",
      "🎯 Save 10% of income",
    ],
    health: [
      "🚰 Drink water! Stay hydrated",
      "🏃♀️ Take a walk break!",
      "🧘 Practice deep breathing",
      "🛌 Maintain sleep schedule",
      "🌞 Get 15 mins sunlight",
      "📏 Track BMI monthly",
    ],
    grocery: [
      "🥦 Add veggies to list",
      "📝 Plan weekly meals",
      "🥛 Check expiration dates",
      "🍌 Buy seasonal fruits",
      "🧂 Restock spices",
      "❄️ Organize freezer",
    ],
    productivity: [
      "📅 Review tomorrow's schedule",
      "⏰ Set deadline reminders",
      "📝 Organize notes",
      "🗂️ Archive old notes",
      "🔔 Take 5-minute breaks",
      "🎯 Use Eisenhower Matrix",
    ],
  };

  const showRandomTip = () => {
    const categories = Object.values(moduleTips);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomTip =
      randomCategory[Math.floor(Math.random() * randomCategory.length)];
    notifyInfo(randomTip, {
      autoClose: 5000,
      closeButton: false,
      position: "top-right",
    });
  };

  useEffect(() => {
    if (!tipsEnabled) return;

    const initialTimeout = setTimeout(showRandomTip, 10000);
    const interval = setInterval(showRandomTip, 10000); // 30 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [tipsEnabled]);

  const toggleTips = () => {
    setTipsEnabled((prev) => !prev);
    notifyInfo(`Tips have been ${!tipsEnabled ? "enabled" : "disabled"}.`, {
      autoClose: 2000,
      closeButton: false,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  return (
    <>
      <header className={styles.header}>
        <a href="#default" className={styles.logo}>
          RAAS
        </a>
        <div className={styles.headerRight}>
          <button className={styles.btns} onClick={() => navigate(`/Profile`)}>
            <FiUser /> Profile
          </button>
          <button className={styles.btns} onClick={() => navigate(`/explore`)}>
            <FiCompass /> Explore
          </button>
          <button className={styles.btns} onClick={toggleTips}>
            <FiBell /> Tips {tipsEnabled ? "(On)" : "(Off)"}
          </button>
          <button className={styles.btns} onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
          <ChatBot />
        </div>
      </header>

      <div className={styles.appContainer}>
        <section className={styles.hero}>
          <h1>RAAS</h1>
          <p>Your one-stop personal management website</p>
        </section>

        <section className={styles.features}>
          <div
            className={styles.featureCard}
            onClick={() => navigate(`/moodform/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaRegSmile />
            </div>
            <h2>Mood Tracker</h2>
            <p>Track and analyze your daily emotions</p>
          </div>

          <div
            className={styles.featureCard}
            onClick={() => navigate(`/finance-tracker/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaMoneyBillWave />
            </div>
            <h2>Finance Tracker</h2>
            <p>Manage your income and expenses</p>
          </div>

          <div
            className={styles.featureCard}
            onClick={() => navigate(`/health-fitness/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaHeartbeat />
            </div>
            <h2>Health Tracker</h2>
            <p>Monitor your fitness and wellness</p>
          </div>

          <div
            className={styles.featureCard}
            onClick={() => navigate(`/book-quotes/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaBook />
            </div>
            <h2>Book & Quotes</h2>
            <p>Discover inspiring books and quotes</p>
          </div>

          <div
            className={styles.featureCard}
            onClick={() => navigate(`/notes-schedule/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaStickyNote />
            </div>
            <h2>Notes & Schedule</h2>
            <p>Organize your tasks and reminders</p>
          </div>

          <div
            className={styles.featureCard}
            onClick={() => navigate(`/recipe-grocery/?userId=${userId}`)}
          >
            <div className={styles.featureIcon}>
              <FaShoppingBasket />
            </div>
            <h2>Recipe & Grocery</h2>
            <p>Plan meals and shopping lists</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} RAAS. All rights reserved.</p>
        </footer>

        <div
          className={styles.chatbotBtn}
          onClick={() => navigate(`/chatbot/?userId=${userId}`)}
        >
          <FiMessageSquare size={24} />
        </div>
      </div>
    </>
  );
};

export default Home;