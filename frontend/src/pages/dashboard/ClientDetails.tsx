import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Building2, Download, Key, Calendar, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients, deleteClient } from '../../features/clients/clientSlice';
import { getLicenses, deleteLicense } from '../../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../../store/store';
import EditClientModal from '../../components/EditClientModal';
import DownloadQuoteModal from '../../components/DownloadQuoteModal';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLicenseForQuote, setSelectedLicenseForQuote] = useState<any>(null);

  const { clients } = useSelector((state: RootState) => state.clients);
  const { licenses } = useSelector((state: RootState) => state.licenses);

  useEffect(() => {
    if (clients.length === 0) dispatch(getClients());
    if (licenses.length === 0) dispatch(getLicenses());
  }, [dispatch, clients.length, licenses.length]);

  const client = clients.find((c: any) => c._id === id) as any;
  const clientLicenses = licenses.filter((lic: any) => 
    lic.clientId === id || lic.clientId?._id === id
  );

  const handleDeleteClient = async () => {
    if (window.confirm("Are you sure? This will delete the company, their user account, and ALL their licenses permanently.")) {
      try {
        await dispatch(deleteClient(id as string)).unwrap();
        toast.success("Client completely removed.");
        navigate('/manager-dashboard');
      } catch (error: any) {
        toast.error(error || "Failed to delete client");
      }
    }
  };

  // Helper function for dynamic status badges
  const getStatusBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRED</span>;
    } else if (diffDays <= 30) {
      return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRING SOON</span>;
    } else {
      return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>;
    }
  };

  if (!client) return <div className="p-10 text-slate-500 font-medium animate-pulse">Loading client data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      
      {/* MODAL OVERLAYS */}
      {isEditModalOpen && <EditClientModal client={client} onClose={() => setIsEditModalOpen(false)} />}
      {selectedLicenseForQuote && (
        <DownloadQuoteModal 
          license={selectedLicenseForQuote} 
          onClose={() => setSelectedLicenseForQuote(null)} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/manager-dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-6">
            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
              <Building2 size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Email:</span> {client.billingEmail}</p>
                <p><span className="font-semibold text-slate-700">Contact:</span> {client.primaryContact?.name || 'Pending'}</p>
                <p><span className="font-semibold text-slate-700">Terms:</span> {client.paymentTerms}</p>
                <p><span className="font-semibold text-slate-700">Reg No:</span> {client.registrationNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Admin Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              <Edit size={18} /> Edit
            </button>
            <button 
              onClick={handleDeleteClient}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>

        {/* Licenses Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Assigned Licenses</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientLicenses.length > 0 ? (
            clientLicenses.map((lic: any) => (
              <div key={lic._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{lic.softwareName}</h3>
                    {getStatusBadge(lic.expiryDate)}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Building2 size={16} className="text-slate-400" />
                      <span>Vendor: <strong>{lic.vendor}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Key size={16} className="text-slate-400" />
                      <span>Seats: <strong>{lic.seatCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Expires: <strong>{new Date(lic.expiryDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <button 
                    onClick={() => setSelectedLicenseForQuote(lic)}
                    className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={16} /> Custom Quote
                  </button>
                  <button 
                    onClick={async () => {
                      if(window.confirm('Delete this software license?')) {
                        try {
                          await dispatch(deleteLicense(lic._id)).unwrap();
                          toast.success('License deleted');
                          // Refresh licenses after deletion
                          dispatch(getLicenses());
                        } catch (e: any) { 
                          toast.error(e?.message || 'Failed to delete license');
                        }
                      }
                    }}
                    className="flex-none px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete License"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <Key className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No licenses found</h3>
              <p className="text-slate-500">This client doesn't have any active software licenses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;