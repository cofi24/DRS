import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function Dashboard() {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email;
  const userRole = user?.role;

  useEffect(() => {
    const token = Cookies.get('jwt-token');
    if (!token || !user) {
      navigate('/login');
    }
  }, []);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/search', {
        params: { q: searchQuery }
      });
      setDiscussions(res.data);
    } catch (error) {
      console.error('Greška pri učitavanju diskusija:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDiscussions();
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleNewPost = () => navigate('/create-discussion');
  const handleEditProfile = () => navigate('/profile');

  const handleDelete = async (discussionId) => {
    if (!window.confirm('Obrisati diskusiju?')) return;
    try {
      const token = Cookies.get('jwt-token');
      await axios.delete(`http://localhost:5000/discussions/${discussionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscussions(discussions.filter(d => d.id !== discussionId));
    } catch (error) {
      console.error('Greška pri brisanju diskusije:', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dobrodošli!</h1>
      <button onClick={handleNewPost} style={{ marginRight: 10 }}>Nova objava</button>
      <button onClick={handleEditProfile}>Izmeni profil</button>

      <h2 style={{ marginTop: 30 }}>Pretraga</h2>
      <input
        type="text"
        placeholder="Pretraži po svemu (tema, sadržaj, email, adresa...)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 20 }}
      />

      <h2>Diskusije</h2>
      {loading ? (
        <p>Učitavanje diskusija...</p>
      ) : discussions.length === 0 ? (
        <p>Nema dostupnih diskusija.</p>
      ) : (
        <ul>
          {discussions.map(d => (
            <li key={d.id} style={{ marginBottom: 15, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
              <h3>{d.title}</h3>
              <p>{d.content.length > 200 ? d.content.slice(0, 200) + '...' : d.content}</p>
              <p><strong>Tema:</strong> {d.topic || 'Nije dodeljena'}</p>
              <p><strong>Autor:</strong> {d.creator || 'Nepoznato'}</p>
              <button onClick={() => navigate(`/discussion/${d.id}`)}>Pogledaj detalje</button>
              {d.creator === userEmail && (
                <button onClick={() => navigate(`/edit-discussion/${d.id}`)} style={{ marginLeft: 10 }}>
                  Izmeni
                </button>
              )}
              {(userRole === 'admin' || d.creator === userEmail) && (
                <button onClick={() => handleDelete(d.id)} style={{ marginLeft: 10, color: 'red' }}>
                  Obriši
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
