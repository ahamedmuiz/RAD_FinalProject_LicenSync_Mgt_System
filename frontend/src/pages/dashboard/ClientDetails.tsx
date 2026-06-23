import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Building2, Download, Key, Calendar, Edit, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients, deleteClient } from '../../features/clients/clientSlice';
import { getLicenses, deleteLicense } from '../../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../../store/store';
import EditClientModal from '../../components/EditClientModal';
import DownloadQuoteModal from '../../components/DownloadQuoteModal';
import EditLicenseModal from '../../components/EditLicenseModal';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLicenseForQuote, setSelectedLicenseForQuote] = useState<any>(null);
  const [selectedLicenseForEdit, setSelectedLicenseForEdit] = useState<any>(null);

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
      } catch (error: any) { toast.error(error || "Failed to delete client"); }
    }
  };

  const getExpirationDetails = (expiryDate: string) => {
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 0) return { expired: true, text: 'EXPIRED', color: 'bg-red-100 text-red-700 border border-red-200', daysText: `${Math.abs(diffDays)} days ago` };
    if (diffDays <= 30) return { expired: false, text: 'EXPIRING SOON', color: 'bg-amber-100 text-amber-700 border border-amber-200', daysText: `in ${diffDays} days` };
    return { expired: false, text: 'ACTIVE', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', daysText: `in ${diffDays} days` };
  };

  if (!client) return <div className="p-10 text-slate-500 font-bold flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      {isEditModalOpen && <EditClientModal client={client} onClose={() => setIsEditModalOpen(false)} />}
      {selectedLicenseForQuote && <DownloadQuoteModal license={selectedLicenseForQuote} onClose={() => setSelectedLicenseForQuote(null)} />}
      {selectedLicenseForEdit && <EditLicenseModal license={selectedLicenseForEdit} onClose={() => setSelectedLicenseForEdit(null)} />}

      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/manager-dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-bold">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Stunning Corporate Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-8 py-5 flex justify-between items-center">
             <h2 className="text-xl font-extrabold text-white flex items-center gap-3"><Building2 size={24} className="text-indigo-400"/> Corporate Profile</h2>
             <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl transition-colors flex items-center gap-2"><Edit size={16} /> Edit</button>
                <button onClick={handleDeleteClient} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-100 font-bold rounded-xl transition-colors flex items-center gap-2"><Trash2 size={16} /> Delete</button>
             </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8 bg-white">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p><p className="text-xl font-black text-slate-900">{client.companyName}</p></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Email</p><p className="text-slate-700 font-bold">{client.billingEmail}</p></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration No.</p><p className="text-slate-700 font-bold">{client.registrationNumber || 'N/A'}</p></div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Terms</p><p className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 inline-block px-3 py-1.5 rounded-lg">{client.paymentTerms}</p></div>
          </div>
        </div>

        <div className="mb-6"><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Licenses</h2></div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {clientLicenses.length > 0 ? (
            clientLicenses.map((lic: any) => {
              const expStatus = getExpirationDetails(lic.expiryDate);
              const seatsEmpty = lic.seatCount === 0;

              return (
                <div key={lic._id} className={`bg-white rounded-3xl shadow-sm border ${expStatus.expired ? 'border-red-200 bg-red-50/20 opacity-90' : 'border-slate-200 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1'} p-8 transition-all duration-300`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className={`text-2xl font-black tracking-tight ${expStatus.expired ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{lic.softwareName}</h3>
                      <p className="text-indigo-600 mt-1 font-bold flex items-center gap-2"><Building2 size={16}/> {lic.vendor}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`${expStatus.color} px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm`}>{expStatus.text}</span>
                      <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-1"><Calendar size={14}/> Expires {expStatus.daysText}</p>
                    </div>
                  </div>

                  {/* Seat Visualizer */}
                  <div className={`rounded-2xl p-5 mb-8 border ${expStatus.expired ? 'bg-white border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-bold text-slate-500 uppercase tracking-wide">License Allocation</span>
                      <span className="font-black text-slate-900">{lic.seatCount} / {lic.totalSeats || lic.seatCount} Available</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className={`h-3 rounded-full ${seatsEmpty ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} style={{ width: `${(lic.seatCount / (lic.totalSeats || lic.seatCount)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {expStatus.expired ? (
                      <div className="flex-1 flex justify-center items-center gap-2 bg-red-100 text-red-700 py-3 rounded-xl font-bold border border-red-200 cursor-not-allowed">
                        <AlertTriangle size={18} /> Terminated - Read Only
                      </div>
                    ) : (
                      <button onClick={() => setSelectedLicenseForQuote(lic)} className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 py-3 rounded-xl font-bold transition-all shadow-sm">
                        <Download size={18} /> Configure Quote
                      </button>
                    )}
                    
                    <button onClick={() => setSelectedLicenseForEdit(lic)} className="flex-none px-4 py-3 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-bold flex items-center justify-center shadow-sm" title="Edit License">
                      <Edit size={18} />
                    </button>
                    <button onClick={async () => {
                        if(window.confirm('Delete this software license?')) {
                          try { await dispatch(deleteLicense(lic._id)).unwrap(); toast.success('License deleted'); } 
                          catch (e: any) { toast.error('Failed to delete'); }
                        }
                      }}
                      className="flex-none px-4 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all font-bold flex items-center justify-center shadow-sm" title="Delete License">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <Key className="mx-auto text-slate-300 mb-4" size={56} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No licenses found</h3>
              <p className="text-slate-500 font-medium">This client hasn't been assigned any software yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;