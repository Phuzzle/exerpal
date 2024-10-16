import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>This is a placeholder screen for the dashboard.</p>
      <Link to="/create-schedule">
        <button>Create new schedule</button>
      </Link>
      <Link to="/resume-schedule">
        <button>Resume existing schedule</button>
      </Link>
      <button>Adjust exercise progress</button>
      <button>Workout history</button>
    </div>
  );
};

export default Dashboard;
