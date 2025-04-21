import React, { useState, useEffect } from "react";
import axios from "axios";
import MoodHistory from "./MoodHistory";
import "./moodstyle.module.css";

const MoodForm = () => {
  const [mood, setMood] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");

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
      <header className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-right">
          <a className="active" href="http://localhost:3000/home">Home</a>
        </div>
      </header>

      <section className="form-section">
        <form className="mood-form" onSubmit={handleSubmit}>
          <h2>Mood Tracker</h2>
          <p>Select your mood</p>
          <div className="mood-buttons">
            {moodList.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`mood-btn ${mood === m ? "selected" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>
          <label>
            <p>Description</p>
            <textarea
              className="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write something about your mood..."
              rows={4}
            />
          </label>
          <button type="submit" className="submit-btn" disabled={!mood}>
            Submit
          </button>
        </form>
      </section>

      {userId && <MoodHistory userId={userId} />}
    </>
  );
};

export default MoodForm;
