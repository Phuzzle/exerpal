import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import './AdjustProgress.css';

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

const AdjustProgress = () => {
  const [schedule, setSchedule] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempChanges, setTempChanges] = useState({});
  const orderedDays = ['day1', 'day2', 'day3', 'day4', 'day5'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user is logged in');
          return;
        }

        // Fetch most recent schedule
        const schedulesRef = collection(db, 'schedules');
        const q = query(schedulesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const scheduleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          const scheduleData = { id: scheduleDoc.id, ...scheduleDoc.data() };
          setSchedule(scheduleData);
        }

        // Fetch progress data
        const progressDoc = doc(db, 'progress', user.uid);
        const progressSnapshot = await getDoc(progressDoc);
        if (progressSnapshot.exists()) {
          setProgressData(progressSnapshot.data());
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const findValidProgressionStage = (sets, reps) => {
    return PROGRESSION_STAGES.findIndex(stage => 
      stage.sets === parseInt(sets) && stage.reps === parseInt(reps)
    );
  };

  const handleTempChange = (day, exerciseIndex, field, value) => {
    const exercise = schedule.exercises[day][exerciseIndex];
    const exerciseId = `${schedule.id}-${exercise.name}`;
    const changeKey = `${day}-${exerciseIndex}`;

    setTempChanges(prev => ({
      ...prev,
      [changeKey]: {
        ...prev[changeKey],
        [field]: value,
        exerciseId,
        day,
        index: exerciseIndex
      }
    }));
  };

  const handleSaveChanges = async (day, exerciseIndex) => {
    const changeKey = `${day}-${exerciseIndex}`;
    const changes = tempChanges[changeKey];
    if (!changes) return;

    const exercise = schedule.exercises[day][exerciseIndex];
    const exerciseId = `${schedule.id}-${exercise.name}`;
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedExercise = { ...exercise };
      let validStage;

      // Handle sets and reps changes
      if (changes.sets || changes.reps) {
        const newSets = changes.sets ? parseInt(changes.sets) : exercise.sets;
        const newReps = changes.reps ? parseInt(changes.reps) : exercise.reps;
        
        validStage = findValidProgressionStage(newSets, newReps);
        if (validStage === -1) {
          alert('Invalid combination of sets and reps. Please use valid progression values.');
          return;
        }

        if (changes.sets) updatedExercise.sets = parseInt(changes.sets);
        if (changes.reps) updatedExercise.reps = parseInt(changes.reps);

        // Update schedule in Firestore
        const scheduleRef = doc(db, 'schedules', schedule.id);
        const updatedExercises = {
          ...schedule.exercises,
          [day]: schedule.exercises[day].map((ex, idx) => 
            idx === exerciseIndex ? updatedExercise : ex
          )
        };
        await updateDoc(scheduleRef, { exercises: updatedExercises });

        // Update progression stage in progress collection
        const progressDoc = doc(db, 'progress', user.uid);
        await updateDoc(progressDoc, {
          [`progressionStages.${exerciseId}`]: validStage,
          lastUpdated: new Date()
        });

        // Update local state
        setSchedule(prevSchedule => ({
          ...prevSchedule,
          exercises: updatedExercises
        }));
      }

      // Handle weight changes
      if (changes.weight !== undefined && exercise.type === 'weighted') {
        const progressDoc = doc(db, 'progress', user.uid);
        await updateDoc(progressDoc, {
          [`weights.${exerciseId}`]: parseFloat(changes.weight),
          lastUpdated: new Date()
        });

        setProgressData(prevData => ({
          ...prevData,
          weights: {
            ...prevData.weights,
            [exerciseId]: parseFloat(changes.weight)
          }
        }));
      }

      // Clear the temp changes for this exercise
      setTempChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[changeKey];
        return newChanges;
      });

    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise. Please try again.');
    }
  };

  const formatDayTitle = (day) => {
    const dayNumber = day.replace('day', '');
    return `Day ${dayNumber}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!schedule) {
    return <div>No schedule found. Please create a schedule first.</div>;
  }

  return (
    <div className="adjust-progress">
      <h1>Adjust Exercise Progress</h1>
      {orderedDays.map(day => (
        schedule.exercises[day] && (
          <div key={day} className="day-section">
            <h2>{formatDayTitle(day)}</h2>
            {schedule.exercises[day].map((exercise, index) => {
              const exerciseId = `${schedule.id}-${exercise.name}`;
              const changeKey = `${day}-${index}`;
              const changes = tempChanges[changeKey] || {};
              const currentWeight = progressData?.weights?.[exerciseId] || 0;

              return (
                <div key={`${day}-${index}`} className="exercise-item">
                  <h3>{exercise.name}</h3>
                  <div className="exercise-details">
                    <p>Type: {exercise.type}</p>
                    <div className="progress-control">
                      <label>Sets:</label>
                      <select
                        value={changes.sets || exercise.sets}
                        onChange={(e) => handleTempChange(day, index, 'sets', e.target.value)}
                      >
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      {changes.sets && (
                        <span className="pending-changes">Current: {exercise.sets}</span>
                      )}
                    </div>
                    <div className="progress-control">
                      <label>Reps:</label>
                      <select
                        value={changes.reps || exercise.reps}
                        onChange={(e) => handleTempChange(day, index, 'reps', e.target.value)}
                      >
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                      </select>
                      {changes.reps && (
                        <span className="pending-changes">Current: {exercise.reps}</span>
                      )}
                    </div>
                    {exercise.type === 'weighted' && (
                      <div className="progress-control">
                        <label>Weight (kg):</label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={changes.weight !== undefined ? changes.weight : currentWeight}
                          onChange={(e) => handleTempChange(day, index, 'weight', e.target.value)}
                        />
                        {changes.weight !== undefined && (
                          <span className="pending-changes">Current: {currentWeight}kg</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="exercise-controls">
                    <button
                      className="save-button"
                      onClick={() => handleSaveChanges(day, index)}
                      disabled={!tempChanges[changeKey]}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ))}
    </div>
  );
};

export default AdjustProgress;
