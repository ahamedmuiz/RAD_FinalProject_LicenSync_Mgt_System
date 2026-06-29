import { useState } from "react";
import {
  FileText,
  X,
  Loader2,
  Users,
  Download,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import licenseService from "../features/licenses/licenseService";

interface DownloadQuoteModalProps {
  license: any;
  onClose: () => void;
}

const DownloadQuoteModal = ({ license, onClose }: DownloadQuoteModalProps) => {
  const [seats, setSeats] = useState<number>(license.seatCount);
  const [price, setPrice] = useState<number>(6500.0);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await licenseService.downloadRFQ(license._id, seats, price);
      toast.success("Quote generated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to generate PDF quote.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    setIsEmailing(true);
    const toastId = toast.loading("Generating PDF and sending email...");
    try {
      await licenseService.emailQuote(license._id, seats, price);
      toast.success("Quotation emailed successfully!", { id: toastId });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to email quote.", {
        id: toastId,
      });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-2 rounded-lg">
              <FileText size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Customize Quote</h2>
              <p className="text-slate-400 text-sm">{license.softwareName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Required Seats
              </label>
              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-3 top-2.5 text-slate-400"
                />
                <input
                  type="number"
                  min="1"
                  required
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unit Price (Rs)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
              <span className="text-blue-800 font-medium">
                Estimated Total:
              </span>
              <span className="text-2xl font-bold text-blue-900">
                Rs.{" "}
                {(seats * price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading || isEmailing}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex justify-center items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Download size={18} /> Download PDF
                  </>
                )}
              </button>
              <button
                onClick={handleEmail}
                disabled={isDownloading || isEmailing}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                {isEmailing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Mail size={18} /> Email Quote
                  </>
                )}
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadQuoteModal;
