import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { io } from 'socket.io-client';
import './AdminRegistrationRequests.css';

const socket = io('http://localhost:5000');

function AdminRegistrationRequests() {
  const [requests, setRequests] = useState([]);

  // Fetch initial registration requests from server
  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/adminregistrationrequests');
      console.log('Fetched requests:', res.data); // <-- Dodaj ovaj log ovde

      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch registration requests', error);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Listen to new registration requests in real time
    socket.on('new_registration_request', (data) => {
      setRequests(prev => [...prev, data]);
    });

    // Listen to approvals and removals to update the list
    socket.on('registration_approved', (data) => {
    setRequests(prev => prev.filter(req => req._id !== data.req_id));
    });

    socket.on('registration_declined', (data) => {
      setRequests(prev => prev.filter(req => req.email !== data.email));
    });

    return () => {
      socket.off('new_registration_request');
      socket.off('registration_approved');
      socket.off('registration_declined');
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.post(`/admin/approve/${id}`);
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      console.error('Failed to approve request', error);
    }
  };

  const handleDecline = async (id) => {
    try {
      await axiosInstance.post(`/admin/decline/${id}`);
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (error) {
      console.error('Failed to decline request', error);
    }
  };

  return (
    <div className="admin-requests-container">
      <h2>Registration Requests</h2>
      {requests.length === 0 && <p>No pending requests.</p>}
      <ul className="requests-list">
        {requests.map((req) => (
          <li key={req._id} className="request-item">
            <div>
              <strong>{req.first_name} {req.last_name}</strong><br />
              Email: {req.email}<br />
              Country: {req.country}<br />
              City: {req.city}<br />
              Phone: {req.phone}
            </div>
            <div className="request-buttons">
              <button className="approve-btn" onClick={() => handleApprove(req._id)}>Approve</button>
              <button className="decline-btn" onClick={() => handleDecline(req._id)}>Decline</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminRegistrationRequests;
