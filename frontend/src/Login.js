import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // CSS Module
import Validation from './LoginValidation';
import axios from 'axios';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);

    if (err.email || err.password) return;

    try {
      const res = await axios.post('http://localhost:9000/login', values);
      if (res.data.userId) {
        localStorage.setItem('userId', res.data.userId);
        navigate('/home');
      } else {
        alert(`Login failed: ${res.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`An error occurred: ${err.response?.data?.message || 'Please try again later.'}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>RAAS</a>
        <div className={styles.headerRight}>
          <button className={styles.exploreBtn} onClick={() => navigate('/explore')}>Explore</button>
        </div>
      </header>
      <div style={{ height: '200px' }} aria-hidden="true"></div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>LOG IN</h1>

        <div className={styles.inputGroup}>
          <FaEnvelope className={styles.icon} />
          <input
            ref={emailRef}
            name="email"
            type="email"
            placeholder="Email"
            value={values.email}
            onChange={handleInput}
            className={styles.input}
            autoComplete="email"
            aria-label="Enter your email"
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.inputGroup}>
          <FaLock className={styles.icon} />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={values.password}
            onChange={handleInput}
            className={styles.input}
            autoComplete="current-password"
            aria-label="Enter your password"
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <button type="submit" className={styles.loginBtn}>Login</button>
        <p className={styles.terms}>By logging in, you agree to our terms and policies.</p>
        <Link to="/Signup" className={styles.createAccountBtn}>Create Account</Link>
      </form>
    </div>
  );
}

export default Login;