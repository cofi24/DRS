import axios from "axios";
import Cookies from 'js-cookie';

const axiosInstance=axios.create({
    baseURL:'http://localhost:5000',
});

axiosInstance.interceptors.request.use((config)=>{
    const token=Cookies.get('jwt-token');
    console.log(token);
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
        console.log("token");
    }
    console.log("after");
    return config;
},(error) => {
    return Promise.reject(error);
});


export default axiosInstance;
