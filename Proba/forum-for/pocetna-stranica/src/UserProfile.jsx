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
        <div className="user-profile-container">
            <h2>Tvoj profil</h2>

            <div className="form-group">
                <label>Ime:</label>
                <input
                    type="text"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                />
            </div>

            <div className="form-group">
                <label>Prezime:</label>
                <input
                    type="text"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                />
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    disabled
                />
            </div>

            <div className="form-group">
                <label>Telefon:</label>
                <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                />
            </div>

            <div className="button-row">
                {isEditing ? (
                    <>
                        <button onClick={handleSave}>Sacuvaj</button>
                        <button className="secondary-button" onClick={() => setIsEditing(false)}>Otkazi</button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)}>Izmeni profil</button>
                )}
            </div>
        </div>
    );

}


export default UserProfile;
