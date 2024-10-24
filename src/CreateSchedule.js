import React, { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateSchedule = () => {
  // Define exercise categories and exercises
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

  // Define the specific exercise limits per muscle group for each day
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

  // State to hold the selected exercises for each day
  const [selectedExercises, setSelectedExercises] = useState({
    day1: [],
    day2: [],
    day3: [],
    day4: [],
    day5: []
  });

  // Function to handle exercise selection
  const handleExerciseSelection = (day, exerciseName) => {
    const muscleGroup = Object.keys(exercises).find(key => exercises[key].some(ex => ex.name === exerciseName));
    const currentCount = selectedExercises[day].filter(ex => exercises[muscleGroup].some(e => e.name === ex.name)).length;
    const exercise = exercises[muscleGroup].find(ex => ex.name === exerciseName);

    if (currentCount < exerciseLimits[day][muscleGroup] && !selectedExercises[day].some(ex => ex.name === exerciseName)) {
      setSelectedExercises(prevState => ({
        ...prevState,
        [day]: [...prevState[day], { ...exercise }]
      }));
    }
  };

  // Function to save selected exercises to Firestore
  const saveSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is currently logged in.');
        return;
      }

      const docRef = await addDoc(collection(db, 'schedules'), {
        exercises: selectedExercises,
        userId: user.uid,
        createdAt: new Date()
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <div>
      <h1>Create New Schedule</h1>
      <p>This page will be populated with functionality to create a new schedule in the future.</p>
      <div>
        <h2>Day 1</h2>
        <div>
          <h3>Pec Dominant</h3>
          <ul>
            {exercises['pec-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day1', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Horizontal</h3>
          <ul>
            {exercises['upper-back-horizontal'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day1', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Shoulder Dominant</h3>
          <ul>
            {exercises['shoulder-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day1', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Vertical</h3>
          <ul>
            {exercises['upper-back-vertical'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day1', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day1.map(exercise => (
            <li key={exercise.name}>{exercise.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 2</h2>
        <div>
          <h3>Knee Dominant</h3>
          <ul>
            {exercises['knee-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day2', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Hip Dominant Accessory</h3>
          <ul>
            {exercises['hip-dominant-accessory'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day2', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Quad Dominant Accessory</h3>
          <ul>
            {exercises['quad-dominant-accessory'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day2', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Calves</h3>
          <ul>
            {exercises['calves'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day2', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day2.map(exercise => (
            <li key={exercise.name}>{exercise.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 3</h2>
        <div>
          <h3>Shoulder Dominant</h3>
          <ul>
            {exercises['shoulder-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day3', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Vertical</h3>
          <ul>
            {exercises['upper-back-vertical'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day3', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Pec Dominant</h3>
          <ul>
            {exercises['pec-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day3', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Horizontal</h3>
          <ul>
            {exercises['upper-back-horizontal'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day3', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day3.map(exercise => (
            <li key={exercise.name}>{exercise.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 4</h2>
        <div>
          <h3>Hip Dominant</h3>
          <ul>
            {exercises['hip-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day4', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Knee Dominant</h3>
          <ul>
            {exercises['knee-dominant'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day4', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Hip Dominant Accessory</h3>
          <ul>
            {exercises['hip-dominant-accessory'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day4', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Calves</h3>
          <ul>
            {exercises['calves'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day4', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day4.map(exercise => (
            <li key={exercise.name}>{exercise.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 5</h2>
        <div>
          <h3>Vanity Lifts</h3>
          <ul>
            {exercises['vanity-lifts'].map(exercise => (
              <li key={exercise.name} onClick={() => handleExerciseSelection('day5', exercise.name)}>{exercise.name}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day5.map(exercise => (
            <li key={exercise.name}>{exercise.name}</li>
          ))}
        </ul>
      </div>
      <button onClick={saveSchedule}>Save Schedule</button>
    </div>
  );
};

export default CreateSchedule;
