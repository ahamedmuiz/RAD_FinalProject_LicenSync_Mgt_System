import api from '../../services/api';

// Fetch all licenses
const getLicenses = async () => {
  const response = await api.get('/licenses');
  return response.data;
};

// Create a new license
const createLicense = async (licenseData: any) => {
  const response = await api.post('/licenses', licenseData);
  return response.data;
};

// Download PDF Quote
const downloadRFQ = async (licenseId: string) => {
  const response = await api.get(`/licenses/${licenseId}/rfq`, {
    responseType: 'blob', // Crucial: Tells Axios to expect a binary file, not JSON!
  });
  
  // Create a temporary hidden link in the browser to trigger the file download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Quotation_${licenseId.substring(0,6)}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const licenseService = {
  getLicenses,
  createLicense,
  downloadRFQ,
};

export default licenseService;