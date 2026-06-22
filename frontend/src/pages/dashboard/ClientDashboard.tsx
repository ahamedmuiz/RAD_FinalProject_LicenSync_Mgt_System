import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ShieldCheck, Key, Calendar, Loader2, Building2, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout, reset as resetAuth } from '../../features/auth/authSlice';
import { getLicenses, consumeSeat, reset as resetLicenses } from '../../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../../store/store';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { licenses, isLoading } = useSelector((state: RootState) => state.licenses);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getLicenses());
    return () => { dispatch(resetLicenses()); };
  }, [user, navigate, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetAuth());
    navigate('/login');
  };

  const handleConsumeSeat = async (licenseId: string, availableSeats: number) => {
    if (availableSeats <= 0) {
      toast.error('No seats available on this license.');
      return;
    }
    if (window.confirm('Consume 1 seat to generate an activation key?')) {
      try {
        await dispatch(consumeSeat(licenseId)).unwrap();
        // In a real app, you might show a modal with a generated serial key here!
        toast.success('Seat consumed! Activation key sent to email.');
      } catch (error: any) {
        toast.error(error || 'Failed to consume seat');
      }
    }
  };

  const getStatusBadge = (expiryDate: string) => {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)); 
    if (diffDays < 0) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRED</span>;
    if (diffDays <= 30) return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRING SOON</span>;
    return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>;
  };

  // Extract company info from the first license (populated by backend)
  const companyInfo = licenses.length > 0 ? licenses[0].clientId : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {user?.mustChangePassword && <ChangePasswordModal />}

      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg"><ShieldCheck className="text-white" size={24} /></div>
          <span className="text-xl font-bold text-slate-800">LicenSync Client Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-600">Welcome, {user?.name}</span>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Client's Company Profile Card */}
        {companyInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex items-start gap-6">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600"><Building2 size={40} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{companyInfo.companyName}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Billing Email:</span> {companyInfo.billingEmail}</p>
                <p><span className="font-semibold text-slate-700">Phone:</span> {companyInfo.phone || 'N/A'}</p>
                <p><span className="font-semibold text-slate-700">Reg No:</span> {companyInfo.registrationNumber || 'N/A'}</p>
                <p><span className="font-semibold text-slate-700">Terms:</span> {companyInfo.paymentTerms}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">My Software Licenses</h2></div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>
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
                        <span>Available Seats: <strong className={`text-lg ${lic.seatCount === 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lic.seatCount}</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <ShieldCheck size={16} className="text-slate-400" />
                        <span>Vendor: <strong>{lic.vendor}</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Expires: <strong>{new Date(lic.expiryDate).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConsumeSeat(lic._id, lic.seatCount)}
                    disabled={lic.seatCount === 0}
                    className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <UserMinus size={18} /> Consume 1 Seat
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Key className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No active licenses</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;