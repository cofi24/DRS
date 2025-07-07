import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { UserContext, UserProvider } from './UserContext';

import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminRegistrationRequests from './AdminRegistrationRequests';
import AdminTopics from './AdminTopics';
import UserProfile from './UserProfile';
import Dashboard from './Dashboard';
import CreateDiscussion from './CreateDiscussion';
import DiscussionDetails from './DiscussionDetails';

function AppRoutes() {
  const { user, token, logout } = useContext(UserContext);

  const checkAuth = () => {
    return token && token !== '';
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const ProtectedRoute = ({ children }) => {
    if (!checkAuth()) return <Navigate to="/login" replace />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!checkAuth()) return <Navigate to="/login" replace />;
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <>
      <nav className="navbar">
        <ul className="navbar-list">
          {checkAuth() ? (
            <>
              <li className="navbar-item">
                <Link to="/dashboard">Početna</Link>
              </li>
              {isAdmin() && (
                <>
                  <li className="navbar-item">
                    <Link to="/adminregistrationrequests">Admin Zahtevi</Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/admintopics">Admin Tematika</Link>
                  </li>
                </>
              )}
              <li className="navbar-item">
                <button
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'red',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-discussion"
          element={
            <ProtectedRoute>
              <CreateDiscussion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-discussion/:id"
          element={
            <ProtectedRoute>
              <CreateDiscussion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discussion/:id"
          element={
            <ProtectedRoute>
              <DiscussionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admintopics"
          element={
            <AdminRoute>
              <AdminTopics />
            </AdminRoute>
          }
        />
        <Route
          path="/adminregistrationrequests"
          element={
            <AdminRoute>
              <AdminRegistrationRequests />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
