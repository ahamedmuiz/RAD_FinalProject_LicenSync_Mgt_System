import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import licenseService from './licenseService';

const initialState = {
  licenses: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getLicenses = createAsyncThunk('licenses/getAll', async (_, thunkAPI) => {
  try {
    return await licenseService.getLicenses();
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createLicense = createAsyncThunk('licenses/create', async (licenseData: any, thunkAPI) => {
  try {
    return await licenseService.createLicense(licenseData);
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});


export const deleteLicense = createAsyncThunk('licenses/delete', async (id: string, thunkAPI) => {
  try {
    await licenseService.deleteLicense(id);
    return id; // Return ID to filter it out of state
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const updateLicense = createAsyncThunk('licenses/update', async (data: {id: string, licenseData: any}, thunkAPI) => {
  try {
    return await licenseService.updateLicense(data.id, data.licenseData);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const consumeSeat = createAsyncThunk('licenses/consume', async (id: string, thunkAPI) => {
  try {
    return await licenseService.consumeSeat(id); // Returns the updated license
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const licenseSlice = createSlice({
  name: 'license',
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
      .addCase(getLicenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLicenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.licenses = action.payload;
      })
      .addCase(getLicenses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createLicense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLicense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.licenses.push(action.payload as never); 
      })
      .addCase(createLicense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

      .addCase(deleteLicense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.licenses = state.licenses.filter((lic: any) => lic._id !== action.payload) as never;
      })
      .addCase(consumeSeat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Find the license and update its seat count
        const index = state.licenses.findIndex((lic: any) => lic._id === action.payload._id);
        if (index !== -1) {
          state.licenses[index] = action.payload as never;
        }
      })

      .addCase(updateLicense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.licenses.findIndex((lic: any) => lic._id === action.payload._id);
        if (index !== -1) {
          state.licenses[index] = action.payload as never;
        }
      })

    
  },
});

export const { reset } = licenseSlice.actions;
export default licenseSlice.reducer;