import React, { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('This email is already registered. Please try logging in instead.');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address format.');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email. Please register first.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password. Please try again.');
        break;
      case 'auth/too-many-requests':
        setError('Too many failed attempts. Please try again later.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your internet connection.');
        break;
      default:
        setError('An error occurred. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <h1>Workout Logger</h1>
      <form className="auth-form">
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={error && !email ? 'error' : ''}
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={error && !password ? 'error' : ''}
            autoComplete="current-password"
          />
        </div>
        <div className="button-group">
          <button 
            type="submit" 
            onClick={handleRegister} 
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <button 
            type="submit" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LandingPage;
