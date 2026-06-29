import { useState } from 'react';
import { Key, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface KeyGeneratedModalProps {
  licenseKey: string;
  softwareName: string;
  onClose: () => void;
}

const KeyGeneratedModal = ({ licenseKey, softwareName, onClose }: KeyGeneratedModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success('Key copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Key size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Seat Consumed!</h2>
        <p className="text-slate-500 mt-2 mb-6">Your activation key for <strong>{softwareName}</strong> is ready.</p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mb-8">
          <code className="text-lg font-mono text-slate-800 font-bold">{licenseKey}</code>
          <button 
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
          >
            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Close & Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default KeyGeneratedModal;