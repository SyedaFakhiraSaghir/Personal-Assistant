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
<<<<<<< HEAD
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
=======
    <>
    <div className="app-container">
    {/* Header */}
    <header className="header">
      <a href="#default" className="logo">RAAS</a>
      <div className="header-actions">
        <button className="header-btn" onClick={() => navigate(`explore`)}>
          Explore
        </button>
      </div>
    </header>
    </div>
      <p></p>
    <section>
        <form onSubmit={handleSubmit}>
          <h1>LOG IN</h1>
          <div>
            <label className="label" htmlFor="email-input"><strong>Email</strong></label>
            <input
              id="email-input"
              name="email"
              type="email"
              placeholder="Enter Email"
              value={values.email}
              onChange={handleInput}
              className="form-control"
              autoComplete="email"
              aria-label="Enter your email"
            />
            {errors.email && <span className="text-danger">{errors.email}</span>}
            <label className="label" htmlFor="password-input"><strong>Password</strong></label>
            <input
              id="password-input"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={values.password}
              onChange={handleInput}
              className="form-control"
              autoComplete="current-password"
              aria-label="Enter your password"
            />
            {errors.password && <span className="text-danger">{errors.password}</span>}
          </div>
          <button className="btn-default" type="submit">Login</button>
          <p>You agree to our terms and policies</p>
          <Link to="/Signup" className="btn-default">Create account</Link>
        </form>
      </section>
    </>
>>>>>>> 061fef21a3b16b01295b56801c0867cc5709d30b
  );
}

export default Login;
