import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5005/api', // Matches your backend port
  withCredentials: true,                // Crucial for HTTP-only cookies
});

// Intercept requests to attach the JWT token if it exists in local storage
api.interceptors.request.use(
  (config) => {
    // We will store the short-lived token in localStorage for easy access
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;