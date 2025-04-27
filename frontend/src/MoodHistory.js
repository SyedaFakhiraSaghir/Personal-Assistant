import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from './moodstyle.module.css';

const MoodHistory = ({ userId }) => {
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
    <div className={styles["calendar-container"]}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Mood History</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        className={styles["rbc-calendar"]}
      />
    </div>
  );
};

export default MoodHistory;