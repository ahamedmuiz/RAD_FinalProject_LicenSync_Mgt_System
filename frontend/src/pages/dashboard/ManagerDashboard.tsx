import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Building2, Plus, Users, LayoutDashboard, Search, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout, reset as resetAuth } from '../../features/auth/authSlice';
import { getClients, reset as resetClients } from '../../features/clients/clientSlice';
import type { AppDispatch, RootState } from '../../store/store';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const { clients, isLoading } = useSelector((state: RootState) => state.clients);

  useEffect(() => {
    if (!user || user.role !== 'PROJECT_MANAGER') {
      navigate('/login');
      return;
    }
    dispatch(getClients());
    return () => { dispatch(resetClients()); };
  }, [user, navigate, dispatch]);

  const onLogout = () => {
    if(window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
      dispatch(resetAuth());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const filteredClients = clients.filter((c: any) => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.billingEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Vibrant Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-violet-900 tracking-tight">
            LicenSync Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-indigo-900 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            {user?.name} (Project Manager)
          </span>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Stunning Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 pb-24 pt-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Portfolio Overview</h1>
            <p className="text-indigo-200 text-lg font-medium">Manage your enterprise clients and software deployments.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/add-client')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5">
              <Building2 size={20} /> Add Client
            </button>
            <button onClick={() => navigate('/add-license')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-md hover:-translate-y-0.5">
              <ShieldCheck size={20} /> Assign License
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-12">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-5">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl"><Users size={32} /></div>
            <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Clients</p><p className="text-3xl font-black text-slate-800">{clients.length}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-5">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl"><Activity size={32} /></div>
            <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Status</p><p className="text-3xl font-black text-slate-800">Operational</p></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-5">
             <div className="w-full relative">
               <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
               <input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" />
             </div>
          </div>
        </div>

        {/* Client Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client: any) => (
              <div key={client._id} onClick={() => navigate(`/client/${client._id}`)} className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 border border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-xl border border-indigo-200 group-hover:scale-110 transition-transform">
                      {client.companyName.charAt(0).toUpperCase()}
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">Client</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{client.companyName}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">{client.billingEmail}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Terms: <span className="text-slate-800 font-bold">{client.paymentTerms}</span></span>
                  <div className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Client Card */}
            <div onClick={() => navigate('/add-client')} className="bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl p-6 flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer transition-all duration-300 min-h-[220px]">
              <div className="bg-white p-4 rounded-full shadow-sm mb-3"><Plus size={32} /></div>
              <p className="font-bold text-lg">Onboard New Client</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;