import api from '../../services/api';

// Fetch all clients
const getClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

// Create a new client
const createClient = async (clientData: any) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

// Update a client
const updateClient = async (clientId: string, clientData: any) => {
  const response = await api.put(`/clients/${clientId}`, clientData);
  return response.data;
};

// Delete a client
const deleteClient = async (clientId: string) => {
  const response = await api.delete(`/clients/${clientId}`);
  return response.data;
};

const clientService = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
};

export default clientService;