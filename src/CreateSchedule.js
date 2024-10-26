import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './CreateSchedule.css';

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const exercises = {
    'pec-dominant': [
      { name: 'Barbell Bench Press', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Dumbbell Bench Press', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Push-ups', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'shoulder-dominant': [
      { name: 'Overhead Press (Barbell)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Push Press', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Arnold Press', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'upper-back-horizontal': [
      { name: 'Barbell Row', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Bent-Over Row (Dumbbell)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Machine row', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'upper-back-vertical': [
      { name: 'Pull-Ups', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Lat Pulldowns', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Close-Grip Lat Pulldown', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'hip-dominant': [
      { name: 'Deadlifts', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Romanian Deadlifts (RDLs)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Barbell Hip Thrust', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Good Mornings', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'knee-dominant': [
      { name: 'Barbell Back Squat', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Front Squat', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Walking Lunges (weighted)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'hip-dominant-accessory': [
      { name: 'Glute Bridges', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Single-Leg RDLs', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Barbell Hip Thrust', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Glute Ham Raises', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'quad-dominant-accessory': [
      { name: 'Goblet Squats', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Step-Ups', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Bulgarian Split Squats', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Wall Sit', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'calves': [
      { name: 'Standing Calf Raises (Barbell)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Seated Calf Raises (Dumbbell)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Single-Leg Calf Raises', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ],
    'vanity-lifts': [
      { name: 'Dumbbell Flyes', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Barbell Curls', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Skullcrushers', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Crunches', type: 'bodyweight', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Shrugs', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 },
      { name: 'Lateral Raise (Dumbbell)', type: 'weighted', sets: 3, reps: 8, weight: null, progressionStage: 0 }
    ]
  };

  const exerciseLimits = {
    day1: {
      'pec-dominant': 1,
      'upper-back-horizontal': 1,
      'shoulder-dominant': 1,
      'upper-back-vertical': 1
    },
    day2: {
      'knee-dominant': 1,
      'hip-dominant-accessory': 1,
      'quad-dominant-accessory': 1,
      'calves': 1
    },
    day3: {
      'shoulder-dominant': 1,
      'upper-back-vertical': 1,
      'pec-dominant': 1,
      'upper-back-horizontal': 1
    },
    day4: {
      'hip-dominant': 1,
      'knee-dominant': 1,
      'hip-dominant-accessory': 1,
      'calves': 1
    },
    day5: {
      'vanity-lifts': 6
    }
  };

  const [selectedExercises, setSelectedExercises] = useState({
    day1: [],
    day2: [],
    day3: [],
    day4: [],
    day5: []
  });

  const [activeDay, setActiveDay] = useState('day1');

  const handleExerciseSelection = (day, exerciseName) => {
    const muscleGroup = Object.keys(exercises).find(key => exercises[key].some(ex => ex.name === exerciseName));
    const currentCount = selectedExercises[day].filter(ex => exercises[muscleGroup].some(e => e.name === ex.name)).length;
    const exercise = exercises[muscleGroup].find(ex => ex.name === exerciseName);

    if (selectedExercises[day].some(ex => ex.name === exerciseName)) {
      setSelectedExercises(prevState => ({
        ...prevState,
        [day]: prevState[day].filter(ex => ex.name !== exerciseName)
      }));
      return;
    }

    if (currentCount < exerciseLimits[day][muscleGroup]) {
      setSelectedExercises(prevState => ({
        ...prevState,
        [day]: [...prevState[day], { ...exercise }]
      }));
    }
  };

  const saveSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to save your schedule.');
        return;
      }

      await addDoc(collection(db, 'schedules'), {
        exercises: selectedExercises,
        userId: user.uid,
        createdAt: new Date()
      });
      alert('Schedule saved successfully!');
    } catch (e) {
      alert('Error saving schedule: ' + e.message);
    }
  };

  const formatMuscleGroup = (group) => {
    return group
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isExerciseSelected = (day, exerciseName) => {
    return selectedExercises[day].some(ex => ex.name === exerciseName);
  };

  const renderExerciseGroup = (day, muscleGroup) => {
    const limit = exerciseLimits[day][muscleGroup];
    const currentCount = selectedExercises[day].filter(ex => 
      exercises[muscleGroup].some(e => e.name === ex.name)
    ).length;

    return (
      <div className="exercise-group" key={muscleGroup}>
        <h3 className="muscle-group-title">
          {formatMuscleGroup(muscleGroup)}
          <span className="exercise-count">
            {currentCount}/{limit} selected
          </span>
        </h3>
        <div className="exercise-cards">
          {exercises[muscleGroup].map(exercise => (
            <div
              key={exercise.name}
              className={`exercise-card ${isExerciseSelected(day, exercise.name) ? 'selected' : ''} 
                         ${currentCount >= limit && !isExerciseSelected(day, exercise.name) ? 'disabled' : ''}`}
              onClick={() => handleExerciseSelection(day, exercise.name)}
            >
              <h4>{exercise.name}</h4>
              <div className="exercise-details">
                <span>{exercise.type}</span>
                <span>{exercise.sets} sets × {exercise.reps} reps</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="create-schedule">
      <h1>Create Your Workout Schedule</h1>
      <p className="instructions">
        Select exercises for each day. Click on an exercise card to add/remove it from your schedule.
      </p>

      <div className="day-tabs">
        {Object.keys(exerciseLimits).map((day) => (
          <button
            key={day}
            className={`day-tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            Day {day.slice(-1)}
          </button>
        ))}
      </div>

      <div className="schedule-content">
        <div className="exercise-selection">
          {Object.keys(exerciseLimits[activeDay]).map(muscleGroup =>
            renderExerciseGroup(activeDay, muscleGroup)
          )}
        </div>

        <div className="selected-exercises">
          <h3>Selected Exercises for Day {activeDay.slice(-1)}</h3>
          {selectedExercises[activeDay].length === 0 ? (
            <p className="no-exercises">No exercises selected yet</p>
          ) : (
            <div className="selected-exercise-list">
              {selectedExercises[activeDay].map((exercise, index) => (
                <div key={index} className="selected-exercise-item">
                  <span>{exercise.name}</span>
                  <button 
                    className="remove-exercise"
                    onClick={() => handleExerciseSelection(activeDay, exercise.name)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        className="save-button"
        onClick={saveSchedule}
      >
        Save Schedule
      </button>
    </div>
  );
};

export default CreateSchedule;
