import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ShieldCheck, Key, Calendar, Loader2, Building2, UserMinus, AlertTriangle, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout, reset as resetAuth } from '../../features/auth/authSlice';
import { getLicenses, consumeSeat, reset as resetLicenses } from '../../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../../store/store';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import KeyGeneratedModal from '../../components/KeyGeneratedModal';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { licenses, isLoading, isError, message } = useSelector((state: RootState) => state.licenses);

  // State for the generated key popup
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<{key: string, name: string} | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getLicenses());
    if (isError) toast.error(message);
    return () => { dispatch(resetLicenses()); };
  }, [user, navigate, dispatch, isError, message]);

  const onLogout = () => {
    if(window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
      dispatch(resetAuth());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const handleConsumeSeat = async (lic: any) => {
    if (window.confirm(`Consume 1 seat for ${lic.softwareName}? This action cannot be undone.`)) {
      try {
        const updatedLicense = await dispatch(consumeSeat(lic._id)).unwrap();
        // Trigger the professional Key Popup!
        setNewlyGeneratedKey({
          key: updatedLicense.licenseKey, 
          name: updatedLicense.softwareName
        });
      } catch (error: any) {
        toast.error(error || 'Failed to consume seat');
      }
    }
  };

  // Upgraded Logic: Calculates Days Remaining
  const getExpirationDetails = (expiryDate: string) => {
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 0) return { expired: true, text: 'EXPIRED', color: 'bg-red-100 text-red-700 border border-red-200', daysText: `${Math.abs(diffDays)} days ago` };
    if (diffDays <= 30) return { expired: false, text: 'EXPIRING SOON', color: 'bg-amber-100 text-amber-700 border border-amber-200', daysText: `in ${diffDays} days` };
    return { expired: false, text: 'ACTIVE', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', daysText: `in ${diffDays} days` };
  };

  // Guard against licenses being an unexpected type (TS may infer never)
  const companyInfo = Array.isArray(licenses) && licenses.length > 0 ? (licenses[0] as any).clientId : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {user?.mustChangePassword && <ChangePasswordModal />}
      
      {/* Popups up when a seat is successfully consumed */}
      {newlyGeneratedKey && (
        <KeyGeneratedModal 
          licenseKey={newlyGeneratedKey.key} 
          softwareName={newlyGeneratedKey.name} 
          onClose={() => setNewlyGeneratedKey(null)} 
        />
      )}

      {/* Vibrant Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-teal-900 tracking-tight">
            LicenSync Portal
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
            {user?.name}
          </span>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Stunning Hero Section */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-950 pb-24 pt-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-emerald-100 text-lg font-medium">Manage your enterprise software subscriptions and activate new seats.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-12">
        
        {/* Full Company Details Visualizer */}
        {companyInfo && (
          <div className="bg-white rounded-3xl shadow-xl shadow-emerald-100/40 border border-slate-100 overflow-hidden mb-10">
            <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
               <h2 className="text-xl font-extrabold text-white flex items-center gap-3"><Building2 size={24} className="text-emerald-400"/> Corporate Profile</h2>
               <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-lg tracking-wider uppercase">Verified Account</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p><p className="text-xl font-black text-slate-900">{companyInfo.companyName}</p></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Email</p><p className="text-slate-700 font-bold">{companyInfo.billingEmail}</p></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration No.</p><p className="text-slate-700 font-bold">{companyInfo.registrationNumber || 'N/A'}</p></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Terms</p><p className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 inline-block px-3 py-1.5 rounded-lg">{companyInfo.paymentTerms}</p></div>
            </div>
          </div>
        )}

        <div className="mb-6"><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Software Licenses</h2></div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {licenses.length > 0 ? (
              licenses.map((lic: any) => {
                const expStatus = getExpirationDetails(lic.expiryDate);
                const seatsEmpty = lic.seatCount === 0;

                return (
                  <div key={lic._id} className={`bg-white rounded-3xl shadow-sm border ${expStatus.expired ? 'border-red-200 bg-red-50/20 opacity-90' : 'border-slate-200 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1'} p-8 transition-all duration-300`}>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className={`text-2xl font-black tracking-tight ${expStatus.expired ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{lic.softwareName}</h3>
                        <p className="text-emerald-600 mt-1 font-bold flex items-center gap-2"><Building2 size={16}/> {lic.vendor}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={`${expStatus.color} px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm`}>
                          {expStatus.text}
                        </span>
                        <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-1"><Calendar size={14}/> Expires {expStatus.daysText}</p>
                      </div>
                    </div>

                    {/* Seat Visualizer */}
                    <div className={`rounded-2xl p-5 mb-8 border ${expStatus.expired ? 'bg-white border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="font-bold text-slate-500 uppercase tracking-wide">License Allocation</span>
                        <span className="font-black text-slate-900">{lic.seatCount} / {lic.totalSeats || lic.seatCount} Available</span>
                      </div>
                      {/* Progress Bar Visual */}
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className={`h-3 rounded-full ${seatsEmpty ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} 
                          style={{ width: `${(lic.seatCount / (lic.totalSeats || lic.seatCount)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {expStatus.expired ? (
                       <div className="w-full flex justify-center items-center gap-2 bg-red-100 text-red-700 py-3.5 rounded-xl font-bold border border-red-200 cursor-not-allowed shadow-sm">
                         <AlertTriangle size={18} /> License Terminated 
                       </div>
                    ) : (
                      <button 
                        onClick={() => handleConsumeSeat(lic)}
                        disabled={seatsEmpty}
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-emerald-600 hover:to-teal-600 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:from-slate-900 disabled:hover:to-slate-800 shadow-md hover:shadow-lg transform active:scale-95"
                      >
                        <Key size={18} /> {seatsEmpty ? 'Out of Seats' : 'Consume 1 Seat & Get Activation Key'}
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutDashboard className="text-slate-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Licenses</h3>
                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Your company has not been assigned any software licenses yet. Please contact your Project Manager.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;