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

// Download PDF Quote (Now accepts dynamic seats and price!)
const downloadRFQ = async (licenseId: string, seats?: number, price?: number) => {
  // Build the URL with query parameters if they exist
  let url = `/licenses/${licenseId}/rfq`;
  const params = new URLSearchParams();
  
  if (seats) params.append('seats', seats.toString());
  if (price) params.append('price', price.toString());
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await api.get(url, {
    responseType: 'blob', 
  });
  
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `Quotation_${licenseId.substring(0,6)}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Delete a license (Admin)
const deleteLicense = async (licenseId: string) => {
  const response = await api.delete(`/licenses/${licenseId}`);
  return response.data;
};

// Consume a seat (Client)
const consumeSeat = async (licenseId: string) => {
  const response = await api.patch(`/licenses/${licenseId}/consume`);
  return response.data;
};

// Update a license
const updateLicense = async (licenseId: string, licenseData: any) => {
  const response = await api.put(`/licenses/${licenseId}`, licenseData);
  return response.data;
};

// Email Quote directly
const emailQuote = async (licenseId: string, seats: number, price: number) => {
  const response = await api.post(`/licenses/${licenseId}/email-quote`, { seats, price });
  return response.data;
};


const licenseService = {
  getLicenses,
  createLicense,
  downloadRFQ,
  deleteLicense,
  consumeSeat,
  updateLicense,
  emailQuote,
};

export default licenseService;