import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

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

  const handleExerciseUpdate = async (day, exerciseIndex, field, value) => {
    if (!schedule || !progressData) return;

    const exercise = schedule.exercises[day][exerciseIndex];
    const exerciseId = `${schedule.id}-${exercise.name}`;
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedExercise = { ...exercise };
      let validStage;

      if (field === 'sets' || field === 'reps') {
        const newSets = field === 'sets' ? parseInt(value) : exercise.sets;
        const newReps = field === 'reps' ? parseInt(value) : exercise.reps;
        
        validStage = findValidProgressionStage(newSets, newReps);
        if (validStage === -1) {
          alert('Invalid combination of sets and reps. Please use valid progression values.');
          return;
        }

        updatedExercise[field] = parseInt(value);

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

      } else if (field === 'weight' && exercise.type === 'weighted') {
        // Update weight in progress collection
        const progressDoc = doc(db, 'progress', user.uid);
        await updateDoc(progressDoc, {
          [`weights.${exerciseId}`]: parseFloat(value),
          lastUpdated: new Date()
        });

        // Update local progress data
        setProgressData(prevData => ({
          ...prevData,
          weights: {
            ...prevData.weights,
            [exerciseId]: parseFloat(value)
          }
        }));
      }

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
              const currentWeight = progressData?.weights?.[exerciseId] || 0;

              return (
                <div key={`${day}-${index}`} className="exercise-item">
                  <h3>{exercise.name}</h3>
                  <div className="exercise-details">
                    <p>Type: {exercise.type}</p>
                    <div className="progress-control">
                      <label>Sets:</label>
                      <select
                        value={exercise.sets}
                        onChange={(e) => handleExerciseUpdate(day, index, 'sets', e.target.value)}
                      >
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                    <div className="progress-control">
                      <label>Reps:</label>
                      <select
                        value={exercise.reps}
                        onChange={(e) => handleExerciseUpdate(day, index, 'reps', e.target.value)}
                      >
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                      </select>
                    </div>
                    {exercise.type === 'weighted' && (
                      <div className="progress-control">
                        <label>Weight (kg):</label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={currentWeight}
                          onChange={(e) => handleExerciseUpdate(day, index, 'weight', e.target.value)}
                        />
                      </div>
                    )}
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
