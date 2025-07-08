import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function DiscussionDetails() {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = Cookies.get('jwt-token');

  // Funkcija za parsiranje emaila iz JWT tokena (ako je tamo)
  const getEmailFromToken = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.email || null;
    } catch {
      return null;
    }
  };

  const [currentUserEmail, setCurrentUserEmail] = useState(getEmailFromToken());

  const fetchDiscussion = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/discussions`);
      const found = res.data.find(d => d.id === id);
      setDiscussion(found);
    } catch (e) {
      console.error('Greška pri učitavanju diskusije:', e);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const commentRes = await axios.get(`http://localhost:5000/discussions/${id}/comments`);
      setComments(commentRes.data);
    } catch (e) {
      console.error('Greška pri učitavanju komentara:', e);
    }
  }, [id]);

  useEffect(() => {
    fetchDiscussion();
    fetchComments();
  }, [fetchDiscussion, fetchComments]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`http://localhost:5000/discussions/${id}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment("");
      fetchComments();
    } catch(e) {
      console.error('Greška pri slanju komentara:', e);
    }
  };

  const likeDislike = async (action) => {
    try {
      await axios.post(`http://localhost:5000/discussions/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDiscussion();
    } catch (e) {
      alert("Već ste ocenili ovu diskusiju.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj komentar?')) return;
    try {
      await axios.delete(`http://localhost:5000/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (e) {
      alert('Nemate pravo da obrišete ovaj komentar.');
      console.error(e);
    }
  };

  console.log("currentUserEmail:", currentUserEmail);
  console.log("discussion.creator:", discussion?.creator);
  console.log("comments:", comments);

  return (
  <div className="discussion-container">
    {discussion ? (
      <>
        <h2>{discussion.title}</h2>
        <p>{discussion.content}</p>

        <div className="discussion-meta">
          <p><strong>Tema:</strong> {discussion.topic}</p>
          <p><strong>Autor:</strong> {discussion.creator}</p>
          <p><strong>Likes:</strong> {discussion.likes} | <strong>Dislikes:</strong> {discussion.dislikes}</p>
        </div>

        <div className="discussion-buttons">
          <button onClick={() => likeDislike("like")}>👍 Like</button>
          <button onClick={() => likeDislike("dislike")}>👎 Dislike</button>
        </div>

        <div className="comments-section">
          <h3>Komentari</h3>
          {comments.length === 0 ? (
            <p>Nema komentara.</p>
          ) : (
            <ul>
              {comments.map(c => (
                <li key={c.id} className="comment-item">
                  <strong>{c.creator}</strong>: {c.content}
                  {(currentUserEmail === c.creator || currentUserEmail === discussion.creator) && (
                    <button onClick={() => handleDeleteComment(c.id)}>Obriši</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <textarea
          rows="4"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Unesite komentar"
        />
        <br />
        <button className="send-comment-btn" onClick={handleCommentSubmit}>Pošalji komentar</button>
      </>
    ) : (
      <p>Učitavanje...</p>
    )}
  </div>
);
}

export default DiscussionDetails;
