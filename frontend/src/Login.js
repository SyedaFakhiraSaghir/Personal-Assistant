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

  const handleSubmit = (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);

    if (!err.email && !err.password) {
      axios.post('http://localhost:9000/login', values)
        .then((res) => {
          if (res.data.userId) {
            localStorage.setItem('userId', res.data.userId);
            navigate('/home');
          } else {
            alert(`Login failed: ${res.data.message || 'Unknown error'}`);
          }
        })
        .catch((err) => {
          alert(`An error occurred: ${err.response?.data?.message || 'Please try again later.'}`);
        });
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>RAAS</a>
        <div className={styles.headerRight}>
          <a className={styles.exploreBtn} href="/explore">Explore</a>
        </div>
      </header>

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
          />
          <span
            className={styles.toggle}
            onClick={() => setShowPassword((prev) => !prev)}
            title="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
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
