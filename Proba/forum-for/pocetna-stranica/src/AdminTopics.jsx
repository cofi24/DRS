import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Admin Topics Management</h2>

      {/* Dodavanje nove teme */}
      <div style={{ marginBottom: '20px' }}>
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

      {/* Lista tema */}
      <ul>
        {topics.map(topic => (
          <li key={topic.id} style={{ marginBottom: '10px' }}>
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
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{topic.name}</strong><br />
                <em>{topic.description}</em><br />
                <button onClick={() => startEdit(topic)}>Edit</button>
                <button onClick={() => handleDeleteTopic(topic.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminTopics;
