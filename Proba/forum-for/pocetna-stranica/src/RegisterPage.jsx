import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

function RegisterPage(){
  const[firstName,setFirstName]=useState('');
  const[lastName,setLastName]=useState('');
  const[userName,setUserName]=useState('');
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
        user_name:userName,
        country: country,
        city: city,
        address: address,
        phone: number
    };

    try{
        console.log(userData);
        const response = await axios.post('http://localhost:5000/register', userData);
        console.log(response);
        console.log(response.data);
        navigate("/login")
    }catch(error){
      console.error("There was an:",error);

    }
  }; 
  const navigateToLogin=()=>{
    navigate('/login');
  };

    return(
      <div>
        <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor='firstname'>First Name</label>
            <input value={firstName} onChange={(e)=>setFirstName(e.target.value)}id="firstname" placeholder="First Name"/>
            <br></br>
            <label htmlFor="lastname">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastname" placeholder="Last Name" />
            <br></br>
            <label htmlFor="username">User Name</label>
            <input value={userName} onChange={(e) => setUserName(e.target.value)} id="username" placeholder="User Name" />
            <br></br>
            <label htmlFor="email">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" />
            <br></br>
            <label htmlFor="password">Password</label>
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" />
            <br></br>
            <label htmlFor="country">Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} id="country" placeholder="Country" />
            <br></br>
            <label htmlFor="city">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} id="city" placeholder="City" />
            <br></br>
            <label htmlFor="address">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} id="address" placeholder="Address" />
            <br></br>
            <label htmlFor="number">Phone Number</label>
            <input value={number} onChange={(e) => setNumber(e.target.value)} id="number" placeholder="Phone Number" />
            <br></br>
            <button type='submit'>Register</button>
          
          </form>
          <button onClick={navigateToLogin}>Already have account? Login here</button>
      </div>
    );


}

export default RegisterPage;