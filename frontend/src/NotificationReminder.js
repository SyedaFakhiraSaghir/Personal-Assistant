import React from 'react'
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.css';
const NotificationReminder=() =>{
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  console.log("User ID from localStorage:", userId);

return (
  
  <>
  <header className={styles.header}>
    <a href="#default" className={styles.logo}>RAAS</a>
    <div className={styles["header-right"]}>
      <button className={styles.btns} onClick={() => navigate('/home')}>Home</button>
    </div>
  </header>
    <div>NotificationReminder</div>
    </>
  )
}

export default NotificationReminder