import React, { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateSchedule = () => {
  // Define exercise categories and exercises
  const exercises = {
    'pec-dominant': ['Barbell Bench Press', 'Dumbbell Bench Press', 'Push-ups'],
    'shoulder-dominant': ['Overhead Press (Barbell)', 'Push Press', 'Arnold Press'],
    'upper-back-horizontal': ['Barbell Row', 'Bent-Over Row (Dumbbell)', 'Machine row'],
    'upper-back-vertical': ['Pull-Ups', 'Lat Pulldowns', 'Close-Grip Lat Pulldown'],
    'hip-dominant': ['Deadlifts', 'Romanian Deadlifts (RDLs)', 'Barbell Hip Thrust', 'Good Mornings'],
    'knee-dominant': ['Barbell Back Squat', 'Front Squat', 'Walking Lunges (weighted)'],
    'hip-dominant-accessory': ['Glute Bridges', 'Single-Leg RDLs', 'Barbell Hip Thrust', 'Glute Ham Raises'],
    'quad-dominant-accessory': ['Goblet Squats', 'Step-Ups', 'Bulgarian Split Squats', 'Wall Sit'],
    'calves': ['Standing Calf Raises (Barbell)', 'Seated Calf Raises (Dumbbell)', 'Single-Leg Calf Raises'],
    'vanity-lifts': ['Dumbbell Flyes', 'Barbell Curls', 'Skullcrushers', 'Crunches', 'Shrugs', 'Lateral Raise (Dumbbell)']
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
  const handleExerciseSelection = (day, exercise) => {
    const muscleGroup = Object.keys(exercises).find(key => exercises[key].includes(exercise));
    const currentCount = selectedExercises[day].filter(ex => exercises[muscleGroup].includes(ex)).length;

    if (currentCount < exerciseLimits[day][muscleGroup] && !selectedExercises[day].includes(exercise)) {
      setSelectedExercises(prevState => ({
        ...prevState,
        [day]: [...prevState[day], exercise]
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
              <li key={exercise} onClick={() => handleExerciseSelection('day1', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Horizontal</h3>
          <ul>
            {exercises['upper-back-horizontal'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day1', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Shoulder Dominant</h3>
          <ul>
            {exercises['shoulder-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day1', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Vertical</h3>
          <ul>
            {exercises['upper-back-vertical'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day1', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day1.map(exercise => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 2</h2>
        <div>
          <h3>Knee Dominant</h3>
          <ul>
            {exercises['knee-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day2', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Hip Dominant Accessory</h3>
          <ul>
            {exercises['hip-dominant-accessory'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day2', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Quad Dominant Accessory</h3>
          <ul>
            {exercises['quad-dominant-accessory'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day2', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Calves</h3>
          <ul>
            {exercises['calves'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day2', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day2.map(exercise => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 3</h2>
        <div>
          <h3>Shoulder Dominant</h3>
          <ul>
            {exercises['shoulder-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day3', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Vertical</h3>
          <ul>
            {exercises['upper-back-vertical'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day3', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Pec Dominant</h3>
          <ul>
            {exercises['pec-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day3', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Upper Back Horizontal</h3>
          <ul>
            {exercises['upper-back-horizontal'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day3', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day3.map(exercise => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 4</h2>
        <div>
          <h3>Hip Dominant</h3>
          <ul>
            {exercises['hip-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day4', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Knee Dominant</h3>
          <ul>
            {exercises['knee-dominant'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day4', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Hip Dominant Accessory</h3>
          <ul>
            {exercises['hip-dominant-accessory'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day4', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Calves</h3>
          <ul>
            {exercises['calves'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day4', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day4.map(exercise => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Day 5</h2>
        <div>
          <h3>Vanity Lifts</h3>
          <ul>
            {exercises['vanity-lifts'].map(exercise => (
              <li key={exercise} onClick={() => handleExerciseSelection('day5', exercise)}>{exercise}</li>
            ))}
          </ul>
        </div>
        <h3>Selected Exercises:</h3>
        <ul>
          {selectedExercises.day5.map(exercise => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </div>
      <button onClick={saveSchedule}>Save Schedule</button>
    </div>
  );
};

export default CreateSchedule;
