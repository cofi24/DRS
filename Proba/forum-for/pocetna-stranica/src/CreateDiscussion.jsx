import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';

function CreateOrEditDiscussion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/topics')
      .then(res => setTopics(res.data))
      .catch(err => console.error('Greška pri učitavanju tema:', err));
  }, []);

  useEffect(() => {
    if (id) {
      axios.get('http://localhost:5000/discussions')
        .then(res => {
          const discussion = res.data.find(d => d.id === id);
          if (discussion) {
            setTitle(discussion.title);
            setContent(discussion.content);
            const topic = topics.find(t => t.name === discussion.topic);
            if (topic) setTopicId(topic.id);
          }
        })
        .catch(err => console.error('Greška pri učitavanju diskusije:', err));
    }
  }, [id, topics]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !content) {
      setError('Naslov i sadržaj su obavezni');
      return;
    }

    try {
      const token = Cookies.get('jwt-token');
      if (!token) {
        setError('Niste ulogovani ili je sesija istekla.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const postData = {
        title,
        content,
        ...(topicId ? { topic_id: topicId } : {})
      };

      if (id) {
        await axios.put(`http://localhost:5000/discussions/${id}`, postData, { headers });
        setSuccessMsg('Diskusija uspešno izmenjena!');
      } else {
        await axios.post('http://localhost:5000/discussions', postData, { headers });
        setSuccessMsg('Diskusija uspešno kreirana!');
        setTitle('');
        setContent('');
        setTopicId('');
      }

      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Greška:', err.response ? err.response.data : err);
      setError('Neuspešno slanje podataka.');
    }
  };

  return (
    <div className="create-discussion-container">
      <h2>{id ? 'Izmeni diskusiju' : 'Kreiraj novu diskusiju'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Naslov:</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div>
          <label>Sadržaj:</label><br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
          />
        </div>
        <div>
          <label>Tema (opciono):</label><br />
          <select value={topicId} onChange={e => setTopicId(e.target.value)}>
            <option value="">--Izaberi temu--</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>
        <button type="submit">{id ? 'Sačuvaj izmene' : 'Kreiraj diskusiju'}</button>
      </form>
    </div>
  );
}

export default CreateOrEditDiscussion;
