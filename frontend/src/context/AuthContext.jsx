import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  
  // Simulate a database of registered users
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const register = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      localStorage.setItem('token', data.token);
      setIsGuest(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!data.user) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem('token', data.token);
      setIsGuest(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'guest', name: 'Guest' };
    setUser(guestUser);
    setIsGuest(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isGuest, 
      login, 
      loginAsGuest, 
      logout, 
      register,
      registeredUsers // Add this for debugging if needed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 