import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ShieldCheck, Download, Key, Calendar, Loader2 } from 'lucide-react';
import { logout, reset as resetAuth } from '../../features/auth/authSlice';
import { getLicenses, reset as resetLicenses } from '../../features/licenses/licenseSlice';
import licenseService from '../../features/licenses/licenseService';
import type { AppDispatch, RootState } from '../../store/store';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { licenses, isLoading, isError, message } = useSelector(
    (state: RootState) => state.licenses
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // This calls the exact same route, but the backend knows it's a Client!
    dispatch(getLicenses());

    return () => {
      dispatch(resetLicenses());
    };
  }, [user, navigate, dispatch]);

  // Helper function to determine badge color based on Expiry Date
  const getStatusBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (expiry < today) {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRED</span>;
    } else if (diffDays <= 30) {
      return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRING SOON</span>;
    } else {
      return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>;
    }
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetAuth());
    navigate('/login');
  };

  const handleDownload = async (licenseId: string) => {
    setIsDownloading(licenseId);
    try {
      await licenseService.downloadRFQ(licenseId);
    } catch (error) {
      alert("Failed to download PDF.");
    }
    setIsDownloading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* SECURITY MODAL OVERLAY */}
      {user?.mustChangePassword && <ChangePasswordModal />}

     
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800">LicenSync Client Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-600">
            Welcome, {user?.name}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Software Licenses</h1>
          <p className="text-slate-500 mt-1">View and manage your active enterprise software subscriptions.</p>
        </div>

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.length > 0 ? (
              licenses.map((lic: any) => (
                <div key={lic._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-800">{lic.softwareName}</h3>
                      {getStatusBadge(lic.expiryDate)}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Key size={16} className="text-slate-400" />
                        <span>License Key: <strong className="font-mono text-xs">{lic.licenseKey}</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <ShieldCheck size={16} className="text-slate-400" />
                        <span>Vendor: <strong>{lic.vendor}</strong> ({lic.seatCount} Seats)</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Expires: <strong>{new Date(lic.expiryDate).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDownload(lic._id)}
                    disabled={isDownloading === lic._id}
                    className="w-full flex justify-center items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isDownloading === lic._id ? 'Generating...' : <><Download size={18} /> Download Quote (PDF)</>}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Key className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No active licenses</h3>
                <p className="text-slate-500">You currently have no software licenses assigned to your account.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;