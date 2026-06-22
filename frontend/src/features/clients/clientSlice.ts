import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import clientService from './clientService';

const initialState = {
  clients: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getClients = createAsyncThunk('clients/getAll', async (_, thunkAPI) => {
  try {
    return await clientService.getClients();
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createClient = createAsyncThunk('clients/create', async (clientData: any, thunkAPI) => {
  try {
    return await clientService.createClient(clientData);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateClient = createAsyncThunk('clients/update', async (data: {id: string, clientData: any}, thunkAPI) => {
  try {
    return await clientService.updateClient(data.id, data.clientData);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteClient = createAsyncThunk('clients/delete', async (id: string, thunkAPI) => {
  try {
    await clientService.deleteClient(id);
    return id; // Return the ID so our state knows which one to remove
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClients.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.clients = action.payload;
      })
      .addCase(getClients.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Add the newly created company to the array without needing to refresh the page
        state.clients.push(action.payload.company as never); 
      })
      .addCase(createClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

      // Add these right after your createClient cases
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Find the client in our array and replace it with the updated data
        const index = state.clients.findIndex((c: any) => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload as never;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Filter out the deleted client instantly
        state.clients = state.clients.filter((c: any) => c._id !== action.payload) as never;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;