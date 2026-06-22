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

// Add it to the export object at the bottom:

const authService = {
  login,
  logout,
  changePassword
};

export default authService;