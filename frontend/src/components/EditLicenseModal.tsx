import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X, Calendar, Key, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateLicense } from '../features/licenses/licenseSlice';
import type { AppDispatch, RootState } from '../store/store';

interface EditLicenseModalProps {
  license: any;
  onClose: () => void;
}

const EditLicenseModal = ({ license, onClose }: EditLicenseModalProps) => {
  // Format the date so it works with the HTML date input
  const formattedDate = new Date(license.expiryDate).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    softwareName: license.softwareName,
    vendor: license.vendor,
    totalSeats: license.totalSeats || license.seatCount,
    seatCount: license.seatCount,
    expiryDate: formattedDate,
  });

  const dispatch = useDispatch<AppDispatch>();
  // We can track global loading state, or use local state for the button
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Available seats cannot exceed total seats
    if (Number(formData.seatCount) > Number(formData.totalSeats)) {
      toast.error('Available seats cannot exceed total purchased seats.');
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(updateLicense({ id: license._id, licenseData: formData })).unwrap();
      toast.success('License updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error || 'Failed to update license');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-2 rounded-lg"><Key size={20} className="text-indigo-400" /></div>
            <h2 className="text-xl font-bold">Edit License</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Software Name</label>
                <input required type="text" name="softwareName" value={formData.softwareName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                <input required type="text" name="vendor" value={formData.vendor} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Purchased Seats</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input required type="number" min="1" name="totalSeats" value={formData.totalSeats} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available Seats</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input required type="number" min="0" name="seatCount" value={formData.seatCount} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLicenseModal;