import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';

function UserProfile() {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      axiosInstance.get(`/user/profile?email=${user.email}`)
        .then(res => setUserData(res.data))
        .catch(err => console.error('Failed to load profile', err));
    }
  }, []);

  const handleChange = (e) => {
    setUserData({...userData, [e.target.name]: e.target.value});
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/user/profile/${userData.email}`, userData);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Your Profile</h2>

      <label>First Name:</label><br />
      <input
        type="text"
        name="first_name"
        value={userData.first_name}
        onChange={handleChange}
        disabled={!isEditing}
      /><br />

      <label>Last Name:</label><br />
      <input
        type="text"
        name="last_name"
        value={userData.last_name}
        onChange={handleChange}
        disabled={!isEditing}
      /><br />

      <label>Email:</label><br />
      <input
        type="email"
        name="email"
        value={userData.email}
        disabled
      /><br />

      <label>Phone:</label><br />
      <input
        type="text"
        name="phone"
        value={userData.phone}
        onChange={handleChange}
        disabled={!isEditing}
      /><br />

      {isEditing ? (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      )}
    </div>
  );
}

export default UserProfile;
