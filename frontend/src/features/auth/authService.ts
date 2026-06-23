import api from '../../services/api';

// Login user
const login = async (userData: any) => {
  const response = await api.post('/auth/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = async () => {
  // Call the backend to destroy the HTTP-Only cookie securely
  await api.post('/auth/logout');
  
  // Clear the local storage
  localStorage.removeItem('user');
};

// Change Password
const changePassword = async (passwordData: any) => {
  const response = await api.put('/auth/change-password', passwordData);
  if (response.data) {
    // Update the local storage with the new user data (where mustChangePassword is now false)
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};




// Forgot Password (Sends Email)
const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset Password (Uses Token)
const resetPassword = async (token: string, password: string) => {
  const response = await api.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

const authService = {
  login,
  logout,
  changePassword,
  forgotPassword, 
  resetPassword,  
};


export default authService;