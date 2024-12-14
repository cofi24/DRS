import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [number, setNumber] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = {
            email: email,
            password: pass,
            first_name: firstName,
            last_name: lastName,
            country: country,
            city: city,
            address: address,
            phone: number
        };

        try {
            const response = await axios.post('http://localhost:5000/register', userData);
            console.log(response);
            navigate("/login");
        } catch (error) {
            console.error("There was an error:", error);
        }
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2 className="register-title">Register</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="First Name" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Last Name" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
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
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Country" 
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="City" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Phone Number" 
                            value={number} 
                            onChange={(e) => setNumber(e.target.value)} 
                            className="form-input" 
                        />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                </form>
                <p className="login-link" onClick={navigateToLogin}>Already have an account? Login here</p>
            </div>
        </div>
    );
}

export default RegisterPage;
