import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/v1";

const axiosInstance = axios.create();

// Set base URL
axiosInstance.defaults.baseURL = BASE_URL;

//  Allow sending cookies (important for authentication)
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;


