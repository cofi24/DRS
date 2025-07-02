import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function Dashboard() {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/discussions');
        setDiscussions(res.data);
      } catch (error) {
        console.error('Greška pri učitavanju diskusija:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const handleNewPost = () => {
    navigate('/create-discussion');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleDelete = async (discussionId) => {
  if (!window.confirm('Da li ste sigurni da želite da obrišete ovu diskusiju?')) return;

  try {
    const token = Cookies.get('jwt-token');
    await axios.delete(`http://localhost:5000/discussions/${discussionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setDiscussions(discussions.filter(d => d.id !== discussionId));
  } catch (error) {
    console.error('Greška pri brisanju diskusije:', error);
    alert('Greška pri brisanju.');
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h1>Dobrodošli!</h1>
      <button onClick={handleNewPost} style={{ marginRight: 10 }}>Nova objava</button>
      <button onClick={handleEditProfile}>Izmeni profil</button>

      <h2 style={{ marginTop: 30 }}>Diskusije</h2>
      {loading ? (
        <p>Učitavanje diskusija...</p>
      ) : discussions.length === 0 ? (
        <p>Nema dostupnih diskusija.</p>
      ) : (
        <ul>
  {discussions.map(discussion => (
    <li key={discussion.id} style={{ marginBottom: 15, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
      <h3>{discussion.title}</h3>
      <p>{discussion.content.length > 200 ? discussion.content.slice(0, 200) + '...' : discussion.content}</p>
      <p><strong>Tema:</strong> {discussion.topic || 'Nije dodeljena'}</p>
      <p><strong>Autor:</strong> {discussion.creator || 'Nepoznato'}</p>
      <button onClick={() => navigate(`/discussion/${discussion.id}`)}>Pogledaj detalje</button>
      <button onClick={() => navigate(`/edit-discussion/${discussion.id}`)} style={{ marginLeft: 10 }}>Izmeni</button>
      <button onClick={() => handleDelete(discussion.id)} style={{ marginLeft: 10, color: 'red' }}>Obriši</button>
    </li>
  ))}
</ul>

      )}
    </div>
  );
}

export default Dashboard;
