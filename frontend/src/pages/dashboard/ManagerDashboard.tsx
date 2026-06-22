import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Building2, Plus, Loader2, Key } from 'lucide-react';
import { logout, reset as resetAuth } from '../../features/auth/authSlice';
import { getClients, reset as resetClients } from '../../features/clients/clientSlice';
import type { AppDispatch, RootState } from '../../store/store';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { clients, isLoading, isError, message } = useSelector(
    (state: RootState) => state.clients
  );

  useEffect(() => {
    // Security check: if they aren't logged in, kick them back to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch the clients as soon as the dashboard loads
    dispatch(getClients());

    // Cleanup function when leaving the dashboard
    return () => {
      dispatch(resetClients());
    };
  }, [user, navigate, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetAuth());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Building2 className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800">LicenSync Admin</span>
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
  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Client Companies</h1>
      <p className="text-slate-500 mt-1">
        Manage your enterprise clients and their portal access.
      </p>
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => navigate('/add-license')}
        className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
      >
        <Key size={20} /> Assign License
      </button>

      <button
        onClick={() => navigate('/add-client')}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
      >
        <Plus size={20} /> Add New Client
      </button>
    </div>
  </div>

  {/* Display Error if fetching fails */}
  {isError && (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
      {message}
    </div>
  )}

  {/* Display Loading Spinner or Client Grid */}
  {isLoading ? (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.length > 0 ? (
        clients.map((client: any) => (
          <div
            key={client._id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {client.companyName}
              </h3>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  client.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {client.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Reg No:</span>{' '}
                {client.registrationNumber || 'N/A'}
              </p>
              <p>
                <span className="font-medium text-slate-700">Email:</span>{' '}
                {client.billingEmail}
              </p>
              <p>
                <span className="font-medium text-slate-700">
                  Primary Contact:
                </span>{' '}
                {client.primaryContact?.name || 'Pending'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button 
  onClick={() => navigate(`/client/${client._id}`)} // <-- ADD ONCLICK HERE
  className="text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors"
>
  View Details & Licenses →
</button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No clients found
          </h3>
          <p className="text-slate-500">
            Get started by creating your first client company.
          </p>
        </div>
      )}
    </div>
  )}
</main>
    </div>
  );
};

export default ManagerDashboard;