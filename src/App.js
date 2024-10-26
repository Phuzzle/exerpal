import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import CreateSchedule from './CreateSchedule';
import ResumeSchedule from './ResumeSchedule';
import AdjustProgress from './AdjustProgress';
import WorkoutHistory from './WorkoutHistory';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" exact element={<LandingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-schedule" element={
            <ProtectedRoute>
              <CreateSchedule />
            </ProtectedRoute>
          } />
          <Route path="/resume-schedule" element={
            <ProtectedRoute>
              <ResumeSchedule />
            </ProtectedRoute>
          } />
          <Route path="/adjust-progress" element={
            <ProtectedRoute>
              <AdjustProgress />
            </ProtectedRoute>
          } />
          <Route path="/workout-history" element={
            <ProtectedRoute>
              <WorkoutHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
