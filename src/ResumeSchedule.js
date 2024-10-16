import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './App.css';

const ResumeSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const db = getFirestore();
      const schedulesCollection = collection(db, 'schedules');
      const schedulesSnapshot = await getDocs(schedulesCollection);
      const schedulesList = schedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedules(schedulesList);
    };

    fetchSchedules();
  }, []);

  return (
    <div className="resume-schedule-container">
      <h1>Resume Existing Schedule</h1>
      <ul>
        {schedules.map(schedule => (
          <li key={schedule.id}>
            {schedule.name} - Created on {schedule.createdAt.toDate().toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResumeSchedule;
