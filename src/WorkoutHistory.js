import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './WorkoutHistory.css';

const WorkoutHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    completionRate: 0,
    mostFrequentExercise: '',
  });
  const [exerciseProgress, setExerciseProgress] = useState({});

  useEffect(() => {
    const fetchWorkoutHistory = async (currentUser) => {
      try {
        const db = getFirestore();
        
        // Get workout history from the new collection
        const historyCollection = collection(db, 'workoutHistory');
        const historyQuery = query(
          historyCollection,
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        const historySnapshot = await getDocs(historyQuery);
        
        const historyData = historySnapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date?.toDate(),
          lastCompletedDay: doc.data().lastCompletedDay,
          exercises: doc.data().exercises || {},
          weights: doc.data().weights || {}
        }));

        // Calculate statistics
        const calculatedStats = calculateStats(historyData);
        setStats(calculatedStats);

        // Calculate exercise progress
        const progressData = calculateExerciseProgress(historyData);
        setExerciseProgress(progressData);

        setHistory(historyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout history:', error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchWorkoutHistory(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateStats = (historyData) => {
    if (historyData.length === 0) {
      return {
        totalWorkouts: 0,
        completionRate: 0,
        mostFrequentExercise: 'None'
      };
    }

    // Calculate total completed exercises across all history
    let totalCompleted = 0;
    let totalExercises = 0;
    const exerciseCounts = {};

    historyData.forEach(entry => {
      Object.entries(entry.exercises).forEach(([exerciseId, status]) => {
        totalExercises++;
        if (status === 'completed') {
          totalCompleted++;
          exerciseCounts[exerciseId] = (exerciseCounts[exerciseId] || 0) + 1;
        }
      });
    });

    // Calculate completion rate across all history
    const completionRate = totalExercises > 0 
      ? ((totalCompleted / totalExercises) * 100).toFixed(1)
      : 0;

    // Find most frequent exercise
    const mostFrequentExercise = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]?.split('-').slice(1).join(' ') || 'None';

    return {
      totalWorkouts: totalCompleted,
      completionRate,
      mostFrequentExercise
    };
  };

  const calculateExerciseProgress = (historyData) => {
    const progress = {};
    
    // Process history in chronological order for progress tracking
    [...historyData].reverse().forEach(entry => {
      Object.entries(entry.weights).forEach(([exerciseId, weight]) => {
        if (!progress[exerciseId]) {
          progress[exerciseId] = [];
        }
        progress[exerciseId].push({
          date: entry.date,
          weight: weight
        });
      });
    });

    return progress;
  };

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Workouts</h3>
          <p className="stat-value">{stats.totalWorkouts}</p>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p className="stat-value">{stats.completionRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Most Frequent Exercise</h3>
          <p className="stat-value">{stats.mostFrequentExercise}</p>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="history-tab">
      {history.map((entry, index) => (
        <div key={index} className="history-item">
          <div className="history-header">
            <h3>{entry.date?.toLocaleDateString(undefined, { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h3>
            <span className="day-badge">Day {entry.lastCompletedDay}</span>
          </div>
          
          <div className="completed-exercises">
            <h4>Completed Exercises</h4>
            <div className="exercise-grid">
              {Object.entries(entry.exercises).map(([exerciseId, status]) => {
                if (status === 'completed') {
                  const weight = entry.weights[exerciseId];
                  const exerciseName = exerciseId.split('-').slice(1).join(' ');
                  return (
                    <div key={exerciseId} className="exercise-card">
                      <span className="exercise-name">{exerciseName}</span>
                      {weight && <span className="exercise-weight">{weight}kg</span>}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProgressTab = () => (
    <div className="progress-tab">
      {Object.entries(exerciseProgress).map(([exerciseId, data]) => {
        const exerciseName = exerciseId.split('-').slice(1).join(' ');
        const latestWeight = data[data.length - 1]?.weight || 0;
        const initialWeight = data[0]?.weight || 0;
        const improvement = ((latestWeight - initialWeight) / initialWeight * 100).toFixed(1);
        
        return (
          <div key={exerciseId} className="progress-card">
            <h3>{exerciseName}</h3>
            <div className="progress-details">
              <div className="progress-stat">
                <span>Starting Weight</span>
                <span>{initialWeight}kg</span>
              </div>
              <div className="progress-stat">
                <span>Current Weight</span>
                <span>{latestWeight}kg</span>
              </div>
              <div className="progress-stat">
                <span>Improvement</span>
                <span className={improvement > 0 ? 'positive' : 'negative'}>
                  {improvement}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <div className="login-prompt">Please log in to view your workout history.</div>;
  }

  return (
    <div className="workout-history-container">
      <h1>Workout History</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </div>
      
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </button>
    </div>
  );
};

export default WorkoutHistory;
