import React from 'react'
import { useNavigate } from 'react-router-dom';
const NotificationReminder=() =>{
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  console.log("User ID from localStorage:", userId);

return (
  
  <>
  
  
  <div className="header">
      <a href="#default" className="logo">RAAS</a>
      <div className="header-right">
        <button className="btns" onClick={() => navigate(`/Profile`)}>Profile</button>
        <button className="btns" onClick={() => navigate(`/notification-reminder/?userId=${userId}`)}>N</button>
      </div>
  </div>
    <div>NotificationReminder</div>
    </>
  )
}

export default NotificationReminder