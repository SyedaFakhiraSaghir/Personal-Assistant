import React, { useState, useEffect } from "react";
import axios from "axios";
import MoodHistory from "./MoodHistory";
import styles from "./moodstyle.module.css";
import { useNavigate } from "react-router-dom";

const MoodForm = () => {
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    setUserId(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID is missing.");
      return;
    }
    try {
      await axios.post(`http://localhost:9000/api/moods`, {
        mood,
        description,
        userId,
      });
      alert("Mood recorded successfully!");
      setMood("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting mood:", error);
      alert("Failed to submit mood.");
    }
  };

  const moodList = ["😊 Happy", "😢 Sad", "😐 Neutral", "😠 Angry", "🤢 Disgusted", "🤩 Excited", "😰 Anxious", "😱 Scared"];


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
        </div>
        <div style={{ height: '900px' }} aria-hidden="true"></div>
    <div>

      <main className={styles["main-content"]}>
        <section className={styles["form-section"]}>
          <form className={styles["mood-form"]} onSubmit={handleSubmit}>
            <h2>Mood Tracker</h2>
            <p>Select your mood</p>
            <div className={styles["mood-buttons"]}>
              {moodList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`${styles["mood-btn"]} ${mood === m ? styles.selected : ""}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <label>
              <p>Description</p>
              <textarea
                className={styles.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about your mood..."
                rows={4}
              />
            </label>
            <button type="submit" className={styles["submit-btn"]} disabled={!mood}>
              Submit
            </button>
          </form>
        </section>

        {userId && (
          <div className={styles["calendar-container"]}>
            <MoodHistory userId={userId} />
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default MoodForm;