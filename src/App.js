import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import CreateSchedule from './CreateSchedule';
import ResumeSchedule from './ResumeSchedule';
import AdjustProgress from './AdjustProgress';
import WorkoutHistory from './WorkoutHistory';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" exact element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-schedule" element={<CreateSchedule />} />
          <Route path="/resume-schedule" element={<ResumeSchedule />} />
          <Route path="/adjust-progress" element={<AdjustProgress />} />
          <Route path="/workout-history" element={<WorkoutHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
