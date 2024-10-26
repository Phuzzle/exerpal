import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to ExerPal</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <p className="dashboard-subtitle">
        Your exclusive fitness companion, crafted by Glens for Glens. This personalized fitness experience
        is designed to meet your unique workout needs and preferences. Choose from the options below to start
        your fitness journey or continue with your existing workout plan.
      </p>
      
      <div className="dashboard-options">
        <Link to="/create-schedule" className="dashboard-option">
          <h3>Create New Schedule</h3>
          <p>Design a personalized workout plan tailored to your fitness goals and preferences.</p>
          <button className="dashboard-button">Get Started</button>
        </Link>

        <Link to="/resume-schedule" className="dashboard-option">
          <h3>Resume Schedule</h3>
          <p>Continue with your existing workout plan and track your progress.</p>
          <button className="dashboard-button">Continue Workout</button>
        </Link>

        <Link to="/adjust-progress" className="dashboard-option">
          <h3>Adjust Progress</h3>
          <p>Update your exercise progress and modify workout intensity as needed.</p>
          <button className="dashboard-button">Update Progress</button>
        </Link>

        <Link to="/workout-history" className="dashboard-option">
          <h3>Workout History</h3>
          <p>View your past workouts and track your fitness journey over time.</p>
          <button className="dashboard-button">View History</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
