import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import './App.css'
function LoginPage() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const loginData = { email: email, password: pass };
        axiosInstance.post('http://localhost:5000/login', loginData)
            .then(response => {
                const token = response.data.access_token;
                Cookies.set('jwt-token', token, { expires: 7, secure: true, sameSite: 'Strict' });
                navigate('/');
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
    };

    const navigateToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={pass} 
                            onChange={(e) => setPass(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p className="signup-link" onClick={navigateToRegister}>Don't have an account? Sign Up</p>
            </div>
        </div>
    );
}

export default LoginPage;
