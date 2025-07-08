import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';
import './AdminTopics.css';


function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [editTopicId, setEditTopicId] = useState(null);
  const [editTopicData, setEditTopicData] = useState({ name: '', description: '' });

  const navigate = useNavigate();

  // Provera da li je korisnik admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');  // preusmeri na pocetnu ako nije admin
    }
  }, [navigate]);

  // Učitaj teme sa servera
  const fetchTopics = async () => {
    try {
      const res = await axiosInstance.get('/topics');
      setTopics(res.data);
    } catch (error) {
      console.error('Failed to fetch topics', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Dodavanje nove teme
  const handleAddTopic = async () => {
    if (!newTopic.name) return alert("Name is required");
    try {
      await axiosInstance.post('/topics', newTopic);
      setNewTopic({ name: '', description: '' });
      fetchTopics();
    } catch (error) {
      console.error('Failed to add topic', error);
    }
  };

  // Brisanje teme
  const handleDeleteTopic = async (id) => {
    try {
      await axiosInstance.delete(`/topics/${id}`);
      fetchTopics();
    } catch (error) {
      console.error('Failed to delete topic', error);
    }
  };

  // Pokretanje editovanja
  const startEdit = (topic) => {
    setEditTopicId(topic.id);
    setEditTopicData({ name: topic.name, description: topic.description });
  };

  // Čuvanje izmena
  const saveEdit = async () => {
    if (!editTopicData.name) return alert("Name is required");
    try {
      await axiosInstance.put(`/topics/${editTopicId}`, editTopicData);
      setEditTopicId(null);
      setEditTopicData({ name: '', description: '' });
      fetchTopics();
    } catch (error) {
      console.error('Failed to update topic', error);
    }
  };

  // Odustajanje od editovanja
  const cancelEdit = () => {
    setEditTopicId(null);
    setEditTopicData({ name: '', description: '' });
  };

  return (
    <div className="admin-container">
      
      <h2>Admin Topics Management</h2>

      {/* Dodavanje nove teme */}
      <div className="add-topic-form">

        <input
          type="text"
          placeholder="Name"
          value={newTopic.name}
          onChange={e => setNewTopic({ ...newTopic, name: e.target.value })}
        />
        <br />
        <textarea
          placeholder="Description"
          value={newTopic.description}
          onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
          rows={3}
          style={{ width: '100%' }}
        />
        <button onClick={handleAddTopic}>Add Topic</button>
      </div>
      <div className="topic-item-form">
      {/* Lista tema */}
      <ul>
        {topics.map(topic => (
          <li key={topic.id} className="topic-item">
            
            {editTopicId === topic.id ? (
              <>
                <input
                  type="text"
                  value={editTopicData.name}
                  onChange={e => setEditTopicData({ ...editTopicData, name: e.target.value })}
                />
                <br />
                <textarea
                  rows={3}
                  style={{ width: '100%' }}
                  value={editTopicData.description}
                  onChange={e => setEditTopicData({ ...editTopicData, description: e.target.value })}
                />
                <button onClick={saveEdit} className="action-button">Save</button>
                <button onClick={cancelEdit} className="action-button">Cancel</button>
              </>
            ) : (
              <>
                <strong>{topic.name}</strong><br />
                <em>{topic.description}</em><br />
                <button onClick={() => startEdit(topic)} className="action-button">Edit</button>
                <button onClick={() => handleDeleteTopic(topic.id)} className="action-button"                            >Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default AdminTopics;
