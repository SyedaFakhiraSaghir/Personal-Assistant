import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const MoodHistory = () => {
  const pathSegments = window.location.pathname.split('/');
  let userId = pathSegments[pathSegments.length - 1]; 
  userId = userId.slice(7);

  const [moods, setMoods] = useState([]);

  // Configure moment.js for the calendar
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    if (!userId) {
      console.error("User ID is not available in URL.");
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
  }, [userId]);  // Fetch data when userId changes

  // Transform moods into events for the calendar
  const events = moods.map((mood) => ({
    title: `${mood.mood}: ${mood.description}`,
    start: new Date(mood.created_at),
    end: new Date(mood.created_at),
  }));

  return (
    <div style={{ padding: "20px" }}>
      <center><h2>Mood History</h2></center>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default MoodHistory;
