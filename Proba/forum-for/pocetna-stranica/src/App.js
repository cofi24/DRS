import './App.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Cookies from 'js-cookie';

function App() {
  const checkAuth = () => {
    const token = Cookies.get('jwt-token');
    return token && token !== '';
  };

  const ProtectedRoute = ({ children }) => {
    if (!checkAuth()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <Link to="/">Pocetna</Link>
            </li>
            <li className="navbar-item">
              <Link to="/login">Login</Link>
            </li>
            <li className="navbar-item">
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
