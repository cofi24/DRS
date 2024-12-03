import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function LoginPage()  {
    const [email,setEmail]=useState('');
    const[pass,setPass]=useState('');
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        
        const loginData={
            email:email,
            password:pass
        };
            
    }
    const navigateToRegister = () => {
        navigate('/register');
    };
    return(
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor='email'>email</label>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email"/>
                <br></br>
                <label htmlFor='password'>password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <br></br>
                <button type='submit'>Login</button>
            </form>
            <button onClick={navigateToRegister}>Don't have account</button>
        </div>
    )
};

export default LoginPage;
