import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AdminRegistrationRequests from './AdminRegistrationRequests';
import AdminTopics from './AdminTopics';
import UserProfile from './UserProfile';
import Cookies from 'js-cookie';
import Dashboard from './Dashboard';
import CreateDiscussion from './CreateDiscussion';
import DiscussionDetails from './DiscussionDetails';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = Cookies.get('jwt-token');

  const checkAuth = () => {
    return token && token !== '';
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
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
    {/* AdminTopics ili Profil se NE nalaze ovde više */}
  </ul>
</nav>


        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-discussion" element={<CreateDiscussion />} />
          <Route path="/edit-discussion/:id" element={<CreateDiscussion />} />
          <Route path="/discussion/:id" element={<DiscussionDetails />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }

          />
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
            path="/admintopics"
            element={
              <ProtectedRoute>
                {isAdmin() ? <AdminTopics /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminregistrationrequests"
            element={
              <ProtectedRoute>
                {isAdmin() ? <AdminRegistrationRequests /> : <Navigate to="/" />}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
