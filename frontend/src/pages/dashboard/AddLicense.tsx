import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Key, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { createLicense, reset } from '../../features/licenses/licenseSlice';
import { getClients } from '../../features/clients/clientSlice';
import type { AppDispatch, RootState } from '../../store/store';

const AddLicense = () => {
  const [formData, setFormData] = useState({
    clientId: '',
    softwareName: '',
    vendor: '',
    seatCount: 1,
    licenseKey: '',
    expiryDate: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // We need BOTH clients (for the dropdown) and licenses (for loading state)
  const { clients } = useSelector((state: RootState) => state.clients);
  const { isLoading, isError, message } = useSelector((state: RootState) => state.licenses);

  useEffect(() => {
    // Fetch clients so our dropdown has data!
    if (clients.length === 0) {
      dispatch(getClients());
    }

    if (isError) {
      alert(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch, clients.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use .unwrap() to safely wait for success before navigating
      await dispatch(createLicense(formData)).unwrap();
      navigate('/manager-dashboard');
    } catch (error) {
      console.error("Failed to assign license:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/manager-dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl text-white">
              <Key size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Assign Software License</h1>
              <p className="text-indigo-100 mt-1">Issue a new software license to an existing client company.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Client Selection */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Client Company *</label>
                <select 
                  required 
                  name="clientId" 
                  value={formData.clientId} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="" disabled>-- Choose a Client --</option>
                  {clients.map((client: any) => (
                    <option key={client._id} value={client._id}>
                      {client.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Software Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Software Name *</label>
                <input required type="text" name="softwareName" value={formData.softwareName} onChange={handleChange} placeholder="e.g. Enterprise DevSuite 2026" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
                <input required type="text" name="vendor" value={formData.vendor} onChange={handleChange} placeholder="e.g. JetBrains, AWS, Microsoft" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Key *</label>
                <input required type="text" name="licenseKey" value={formData.licenseKey} onChange={handleChange} placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Seats *</label>
                <input required type="number" min="1" name="seatCount" value={formData.seatCount} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date *</label>
                <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/manager-dashboard')}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Assigning...</> : <><CheckCircle2 size={18} /> Assign License</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLicense;