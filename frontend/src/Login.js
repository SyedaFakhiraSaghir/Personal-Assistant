import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import Validation from './LoginValidation';
import axios from 'axios';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form submission

    const err = Validation(values); // Validate input
    setErrors(err);

    if (!err.email && !err.password) {
      axios.post('http://localhost:9000/login', values)
        .then((res) => {
          if (res.data.userId) {
            localStorage.setItem('userId', res.data.userId); // Save user ID in local storage
            console.log(res.data.userId);
            // alert('Login successful!');
            navigate('/home'); // Redirect to home or dashboard
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
    <>
      <div className="header">
        <a href="#default" className="logo">RAAS</a>
        <div className="header-right">
          <a className="btns" href="/explore">Explore</a>
        </div>
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
  );
}

export default Login;