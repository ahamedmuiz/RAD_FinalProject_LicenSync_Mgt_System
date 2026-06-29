import axios from 'axios';

const api = axios.create({
  // Pointing to your live Render backend
  baseURL: 'https://rad-finalproject-licensync-mgt-system-yl9c.onrender.com/api',
  withCredentials: true, // Crucial for sending/receiving our HTTP-Only cookie
});

// 1. REQUEST INTERCEPTOR: Attach the short-lived token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: The Auto-Refresh Logic
api.interceptors.response.use(
  (response) => response, // If request succeeds, just pass it through
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Token Expired) AND we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried so we don't infinite loop

      try {
        // Use bare Axios to hit the live Render refresh endpoint
        const refreshResponse = await axios.get('https://rad-finalproject-licensync-mgt-system-yl9c.onrender.com/api/auth/refresh', {
          withCredentials: true, // Send the hidden cookie!
        });

        const newToken = refreshResponse.data.token;

        // Update the token in localStorage
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          user.token = newToken;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Update the failed request with the new token and try again
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If the refresh token fails (e.g. 7 days passed), force a hard logout
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;