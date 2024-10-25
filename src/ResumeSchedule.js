import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './App.css';

const PROGRESSION_STAGES = [
  { sets: 3, reps: 8 },
  { sets: 4, reps: 8 },
  { sets: 5, reps: 8 },
  { sets: 3, reps: 10 },
  { sets: 4, reps: 10 },
  { sets: 5, reps: 10 },
  { sets: 3, reps: 12 },
  { sets: 4, reps: 12 },
  { sets: 5, reps: 12 }
];

const ResumeSchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [weights, setWeights] = useState({});
  const [progressionStages, setProgressionStages] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastCompletedDay, setLastCompletedDay] = useState(null);

  const fetchUserData = useCallback(async (currentUser) => {
    try {
      const db = getFirestore();
      
      const schedulesCollection = collection(db, 'schedules');
      const schedulesSnapshot = await getDocs(schedulesCollection);
      const schedulesList = schedulesSnapshot.docs
        .filter(doc => doc.data().userId === currentUser.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      setSchedules(schedulesList);
      
      const progressData = await ensureProgressDocExists(currentUser.uid);
      
      setExerciseProgress(progressData.exercises || {});
      setWeights(progressData.weights || {});
      setProgressionStages(progressData.progressionStages || {});
      setCurrentDay(progressData.currentDay || 1);
      setLastCompletedDay(progressData.lastCompletedDay);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const calculateNextWeight = (currentWeight) => {
    return currentWeight + 5;
  };

  const getNextProgressionStage = (currentStage, exerciseType, currentWeight) => {
    const nextStage = (currentStage + 1) % PROGRESSION_STAGES.length;
    
    if (nextStage === 0 && exerciseType === 'weighted' && currentWeight) {
      return {
        stage: 0,
        weight: calculateNextWeight(currentWeight)
      };
    }
    
    return {
      stage: nextStage,
      weight: currentWeight
    };
  };

  const ensureProgressDocExists = async (userId) => {
    const db = getFirestore();
    const progressDoc = doc(db, 'progress', userId);
    const progressSnapshot = await getDoc(progressDoc);
    
    if (!progressSnapshot.exists()) {
      const initialData = {
        exercises: {},
        weights: {},
        progressionStages: {},
        currentDay: 1,
        lastCompletedDay: null,
        lastUpdated: new Date()
      };
      await setDoc(progressDoc, initialData);
      return initialData;
    }
    
    return progressSnapshot.data();
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleDaySelect = (day) => {
    setCurrentDay(day);
  };

  const handleWeightChange = async (exerciseId, weight) => {
    if (!user) return;

    try {
      const newWeights = {
        ...weights,
        [exerciseId]: parseFloat(weight)
      };

      setWeights(newWeights);

      const db = getFirestore();
      const progressDoc = doc(db, 'progress', user.uid);
      await updateDoc(progressDoc, {
        weights: newWeights,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating weight:', error);
    }
  };

  const handleExerciseComplete = async (exerciseId, status, exercise) => {
    if (!user) return;

    try {
      if (exercise.type === 'weighted' && !weights[exerciseId] && status === 'completed') {
        alert('Please enter a weight before marking this exercise as complete');
        return;
      }

      const newProgress = {
        ...exerciseProgress,
        [exerciseId]: status
      };

      const db = getFirestore();
      const progressDoc = doc(db, 'progress', user.uid);
      
      await updateDoc(progressDoc, {
        exercises: newProgress,
        lastUpdated: new Date()
      });

      setExerciseProgress(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDayComplete = async () => {
    if (!user || !selectedSchedule) return;

    const dayExercises = selectedSchedule.exercises[`day${currentDay}`];
    const allAttempted = dayExercises.every(ex => {
      const status = exerciseProgress[`${selectedSchedule.id}-${ex.name}`];
      return status === 'completed' || status === 'failed';
    });

    if (!allAttempted) {
      alert('Please complete or mark as failed all exercises before marking the day as complete');
      return;
    }

    try {
      const db = getFirestore();
      const progressDoc = doc(db, 'progress', user.uid);
      
      // Get the latest progression data from Firestore
      const progressSnapshot = await getDoc(progressDoc);
      const currentProgressData = progressSnapshot.data();

      let updatedProgressionStages = { ...currentProgressData.progressionStages };
      let updatedWeights = { ...currentProgressData.weights };

      // Update progression only for completed exercises
      for (const exercise of dayExercises) {
        const exerciseId = `${selectedSchedule.id}-${exercise.name}`;
        const status = currentProgressData.exercises?.[exerciseId];
        
        if (status === 'completed') {
          const currentStage = currentProgressData.progressionStages?.[exerciseId] || 0;
          const currentWeight = currentProgressData.weights?.[exerciseId];
          
          const { stage: nextStage, weight: nextWeight } = getNextProgressionStage(
            currentStage,
            exercise.type,
            currentWeight
          );

          updatedProgressionStages[exerciseId] = nextStage;
          if (nextWeight !== currentWeight) {
            updatedWeights[exerciseId] = nextWeight;
          }
        }
      }

      const updatedData = {
        progressionStages: updatedProgressionStages,
        weights: updatedWeights,
        lastCompletedDay: currentDay,
        lastUpdated: new Date()
      };

      // Update Firestore
      await updateDoc(progressDoc, updatedData);

      // Update local state
      setProgressionStages(updatedProgressionStages);
      setWeights(updatedWeights);
      setLastCompletedDay(currentDay);

      alert('Day completed! Progression updated for completed exercises.');
    } catch (error) {
      console.error('Error completing day:', error);
    }
  };

  const handleStartNewWeek = async () => {
    if (!user || !selectedSchedule) return;

    try {
      const db = getFirestore();
      const progressDoc = doc(db, 'progress', user.uid);

      // Get current progress data
      const progressSnapshot = await getDoc(progressDoc);
      const currentData = progressSnapshot.data();

      // Save current progress to workout history before clearing
      if (Object.keys(currentData.exercises).length > 0) {
        const historyCollection = collection(db, 'workoutHistory');
        await addDoc(historyCollection, {
          userId: user.uid,
          date: serverTimestamp(), // Using serverTimestamp instead of lastUpdated
          lastCompletedDay: currentData.lastCompletedDay,
          exercises: currentData.exercises,
          weights: currentData.weights,
          scheduleId: selectedSchedule.id
        });
      }

      const updatedData = {
        exercises: {},
        currentDay: 1,
        lastCompletedDay: null,
        weights: currentData.weights || {},
        progressionStages: currentData.progressionStages || {},
        lastUpdated: new Date()
      };

      await updateDoc(progressDoc, updatedData);

      setExerciseProgress({});
      setCurrentDay(1);
      setLastCompletedDay(null);

    } catch (error) {
      console.error('Error starting new week:', error);
    }
  };

  const isDayComplete = (day) => {
    if (!selectedSchedule) return false;
    const dayExercises = selectedSchedule.exercises[`day${day}`];
    return dayExercises.every(ex => {
      const status = exerciseProgress[`${selectedSchedule.id}-${ex.name}`];
      return status === 'completed' || status === 'failed';
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your schedules.</div>;
  }

  if (!selectedSchedule) {
    return (
      <div className="resume-schedule-container">
        <h1>Resume Existing Schedule</h1>
        <div className="schedules-list">
          {schedules.map(schedule => (
            <div 
              key={schedule.id} 
              className="schedule-item"
              onClick={() => handleScheduleSelect(schedule)}
            >
              <h3>{schedule.createdAt.toDate().toLocaleDateString()}</h3>
              <p>Click to view exercises</p>
            </div>
          ))}
        </div>
        <button className="back-button" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="resume-schedule-container">
      <div className="schedule-header">
        <h1>Workout Schedule</h1>
        {lastCompletedDay && (
          <p className="last-completed">Last completed: Day {lastCompletedDay}</p>
        )}
        <button 
          className="new-week-button" 
          onClick={handleStartNewWeek}
          title="Reset progress while keeping your weights and progression stages"
        >
          Start New Week
        </button>
      </div>

      <div className="day-selector">
        {[1, 2, 3, 4, 5].map(day => (
          <div
            key={day}
            className={`day-option ${currentDay === day ? 'selected' : ''} ${isDayComplete(day) ? 'completed' : ''}`}
            onClick={() => handleDaySelect(day)}
          >
            <h3>Day {day}</h3>
            <div className="exercise-preview">
              {selectedSchedule.exercises[`day${day}`].map(exercise => {
                const status = exerciseProgress[`${selectedSchedule.id}-${exercise.name}`];
                return (
                  <p key={exercise.name} className={status || ''}>
                    {exercise.name}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="current-day-exercises">
        <h2>Day {currentDay} Exercises</h2>
        <div className="exercises-list">
          {selectedSchedule.exercises[`day${currentDay}`].map(exercise => {
            const exerciseId = `${selectedSchedule.id}-${exercise.name}`;
            const status = exerciseProgress[exerciseId];
            const currentWeight = weights[exerciseId];
            const currentStage = progressionStages[exerciseId] || 0;
            const { sets, reps } = PROGRESSION_STAGES[currentStage];
            
            return (
              <div key={exercise.name} className={`exercise-item ${status || ''}`}>
                <h3>{exercise.name}</h3>
                <p>{sets} sets x {reps} reps</p>
                {exercise.type === 'weighted' && (
                  <div className="weight-input">
                    <label>
                      Weight (kgs):
                      <input
                        type="number"
                        value={currentWeight || ''}
                        onChange={(e) => handleWeightChange(exerciseId, e.target.value)}
                        placeholder="Enter weight"
                        min="0"
                        step="5"
                        required={exercise.type === 'weighted'}
                      />
                    </label>
                  </div>
                )}
                <div className="exercise-status">
                  <label className="status-option">
                    <input
                      type="radio"
                      name={`status-${exerciseId}`}
                      checked={status === 'completed'}
                      onChange={() => handleExerciseComplete(exerciseId, 'completed', exercise)}
                    />
                    Complete
                  </label>
                  <label className="status-option">
                    <input
                      type="radio"
                      name={`status-${exerciseId}`}
                      checked={status === 'failed'}
                      onChange={() => handleExerciseComplete(exerciseId, 'failed', exercise)}
                    />
                    Failed
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <button 
          className="day-complete-button"
          onClick={handleDayComplete}
          disabled={!isDayComplete(currentDay)}
        >
          Day Complete
        </button>
      </div>
      <div className="button-container">
        <button className="back-button" onClick={() => setSelectedSchedule(null)}>Back to Schedules</button>
        <button className="back-button" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    </div>
  );
};

export default ResumeSchedule;
