import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, ArrowLeft, Loader2, Building2, Box, Calendar, Key, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClients } from '../../features/clients/clientSlice';
import { createLicense } from '../../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../../store/store';

const AddLicense = () => {
  const [formData, setFormData] = useState({
    clientId: '',
    softwareName: '',
    vendor: '',
    seatCount: '',
    licenseKey: '',
    expiryDate: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { clients } = useSelector((state: RootState) => state.clients);
  const { isLoading } = useSelector((state: RootState) => state.licenses);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createLicense({ ...formData, seatCount: Number(formData.seatCount) })).unwrap();
      toast.success('Software License Assigned Successfully!');
      navigate('/manager-dashboard');
    } catch (error: any) {
      toast.error(error || 'Failed to assign license');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/manager-dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-bold">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-8 flex items-center gap-5">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner">
              <ShieldCheck size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Assign Software License</h1>
              <p className="text-indigo-100 mt-1 font-medium">Link a new enterprise software subscription to a client.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-8">
            <div className="space-y-6">
              
              {/* Client Dropdown */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Select Client Company *</label>
                <div className="relative">
                  <Building2 size={20} className="absolute left-4 top-3.5 text-indigo-400" />
                  <select required name="clientId" value={formData.clientId} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-700 appearance-none">
                    <option value="" disabled>-- Select a Client --</option>
                    {clients.map((client: any) => (
                      <option key={client._id} value={client._id}>{client.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Software Name *</label>
                  <div className="relative">
                    <Box size={20} className="absolute left-4 top-3.5 text-blue-400" />
                    <input required type="text" name="softwareName" placeholder="e.g. AutoCAD 2026" value={formData.softwareName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Vendor *</label>
                  <div className="relative">
                    <Building2 size={20} className="absolute left-4 top-3.5 text-purple-400" />
                    <input required type="text" name="vendor" placeholder="e.g. Autodesk" value={formData.vendor} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Purchased Seats *</label>
                  <div className="relative">
                    <Users size={20} className="absolute left-4 top-3.5 text-emerald-400" />
                    <input required type="number" min="1" name="seatCount" placeholder="50" value={formData.seatCount} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Expiry Date *</label>
                  <div className="relative">
                    <Calendar size={20} className="absolute left-4 top-3.5 text-amber-400" />
                    <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Master License Key *</label>
                  <div className="relative">
                    <Key size={20} className="absolute left-4 top-3.5 text-rose-400" />
                    <input required type="text" name="licenseKey" placeholder="XXXX-XXXX-XXXX-XXXX" value={formData.licenseKey} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-mono font-bold text-slate-800 tracking-wider" />
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-4 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => navigate('/manager-dashboard')} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="flex-[2] flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70">
                  {isLoading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : 'Assign License'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLicense;