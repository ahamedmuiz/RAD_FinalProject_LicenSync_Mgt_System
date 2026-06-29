import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateClient } from '../features/clients/clientSlice';
import type { AppDispatch, RootState } from '../store/store';

interface EditClientModalProps {
  client: any;
  onClose: () => void;
}

const EditClientModal = ({ client, onClose }: EditClientModalProps) => {
  const [formData, setFormData] = useState({
    companyName: client.companyName,
    registrationNumber: client.registrationNumber || '',
    billingAddress: client.billingAddress || '',
    phone: client.phone || '',
    paymentTerms: client.paymentTerms || 'Net 30',
  });

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.clients);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateClient({ id: client._id, clientData: formData })).unwrap();
      toast.success('Client updated successfully');
      onClose(); // Close the modal on success
    } catch (error: any) {
      toast.error(error || 'Failed to update client');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Client Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
              <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none">
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
              <input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;