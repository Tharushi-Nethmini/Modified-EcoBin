import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const PrivateRoute = ({ children }) => {
  // Enhanced: Check for local login or Google OAuth session
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check local login first
      if (localStorage.getItem('isLoggedIn') === 'true') {
        setIsAuthenticated(true);
        return;
      }
      // Check Google OAuth session by calling backend
      try {
        const res = await axios.get('http://localhost:8070/profile', { withCredentials: true });
        if (res.status === 200 && res.data && res.data.email) {
          setIsAuthenticated(true);
          return;
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // Show loading spinner while checking auth
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
