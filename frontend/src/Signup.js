import React, { useState } from 'react';
import axios from 'axios';
import './signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate =useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [phone_number, setPhone] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9000/Signup', {
        name,
        email,
        password,
        age
      });
      alert(response.data.message); // Handle success
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred"); // Handle errors
    }
  };

  return (
    <>
    <div class="header">
        <a href="#default" class="logo">RAAS</a>
        <div class="header-right">
          <a class="active" href="http://localhost:3000/explore">Explore</a>
        </div>
      </div>
    <div className=''>
        <div>
          <center><h2>Signup</h2></center>
          <form onSubmit={handleSubmit} class='signup-container'>
            <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p></p>
            </div>
            <div className=''>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <p></p>
            <div className=''>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            <p></p>
            <div className=''>
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            /></div>
            <p></p>
            
            <div className=''>
            <input
              type="text"
              placeholder="Phone"
              value={phone_number}
              onChange={(e) => setPhone(e.target.value)}
            /></div>
            <p></p>

            <button type="submit">Signup</button>
          </form>
    </div>
    </div>
    </>
  );
};

export default Signup;