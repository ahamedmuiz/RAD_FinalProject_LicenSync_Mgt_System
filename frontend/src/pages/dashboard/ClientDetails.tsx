import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Building2, Download, Key, Calendar } from 'lucide-react';
import { getClients } from '../../features/clients/clientSlice';
import { getLicenses } from '../../features/licenses/licenseSlice';
import licenseService from '../../features/licenses/licenseService';
import type { AppDispatch, RootState } from '../../store/store';

const ClientDetails = () => {
  const { id } = useParams(); // Grabs the client ID from the URL
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { clients } = useSelector((state: RootState) => state.clients);
  const { licenses } = useSelector((state: RootState) => state.licenses);

  useEffect(() => {
    // If the user refreshed the page, global state might be empty. Fetch it!
    if (clients.length === 0) dispatch(getClients());
    if (licenses.length === 0) dispatch(getLicenses());
  }, [dispatch, clients.length, licenses.length]);

  // Find the specific client and their licenses
  const client = clients.find((c: any) => c._id === id) as any;
  const clientLicenses = licenses.filter((lic: any) => 
    lic.clientId === id || lic.clientId?._id === id
  );

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

  const handleDownload = async (licenseId: string) => {
    setIsDownloading(licenseId);
    try {
      await licenseService.downloadRFQ(licenseId);
    } catch (error) {
      alert("Failed to download PDF. Please try again.");
    }
    setIsDownloading(null);
  };

  if (!client) return <div className="p-10">Loading client data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/manager-dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex items-start gap-6">
          <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
            <Building2 size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
            <div className="flex gap-6 mt-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-700">Email:</span> {client.billingEmail}</p>
              <p><span className="font-semibold text-slate-700">Contact:</span> {client.primaryContact?.name || 'Pending'}</p>
              <p><span className="font-semibold text-slate-700">Terms:</span> {client.paymentTerms}</p>
            </div>
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

                <button 
                  onClick={() => handleDownload(lic._id)}
                  disabled={isDownloading === lic._id}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isDownloading === lic._id ? 'Generating...' : <><Download size={18} /> Download Quote (PDF)</>}
                </button>
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