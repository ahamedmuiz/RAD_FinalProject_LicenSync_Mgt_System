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

const clientService = {
  getClients,
  createClient,
};

export default clientService;