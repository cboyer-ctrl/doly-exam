import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CandidatePage from './pages/CandidatePage';
import StaffPage from './pages/StaffPage';

export const AppContext = React.createContext();

export default function App() {
  const [role, setRole] = useState(null); // null | 'candidate' | 'staff'
  const [staffUser, setStaffUser] = useState(null);
  const [candidateSession, setCandidateSession] = useState(null);

  // Persist staff session
  useEffect(() => {
    const stored = sessionStorage.getItem('doly_staff');
    if (stored) {
      try { setStaffUser(JSON.parse(stored)); setRole('staff'); } catch {}
    }
    const storedCandidate = sessionStorage.getItem('doly_candidate');
    if (storedCandidate) {
      try { setCandidateSession(JSON.parse(storedCandidate)); setRole('candidate'); } catch {}
    }
  }, []);

  function handleStaffLogin(user) {
    setStaffUser(user);
    setRole('staff');
    sessionStorage.setItem('doly_staff', JSON.stringify(user));
  }

  function handleCandidateJoin(session) {
    setCandidateSession(session);
    setRole('candidate');
    sessionStorage.setItem('doly_candidate', JSON.stringify(session));
  }

  function handleLogout() {
    setRole(null);
    setStaffUser(null);
    setCandidateSession(null);
    sessionStorage.clear();
  }

  return (
    <AppContext.Provider value={{ role, staffUser, candidateSession, handleStaffLogin, handleCandidateJoin, handleLogout }}>
      <div className="app">
        {!role && <LandingPage />}
        {role === 'candidate' && <CandidatePage />}
        {role === 'staff' && <StaffPage />}
      </div>
    </AppContext.Provider>
  );
}
