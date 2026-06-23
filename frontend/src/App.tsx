import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword'; 
import ResetPassword from './pages/auth/ResetPassword';   
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AddClient from './pages/dashboard/AddClient';
import AddLicense from './pages/dashboard/AddLicense';
import ClientDetails from './pages/dashboard/ClientDetails';
import ClientDashboard from './pages/dashboard/ClientDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} /> 
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <-- ADD ROUTE */}
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* <-- ADD ROUTE */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} /> 
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/add-license" element={<AddLicense />} />
          <Route path="/client/:id" element={<ClientDetails />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;