import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import clientReducer from '../features/clients/clientSlice'; 
import licenseReducer from '../features/licenses/licenseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer, 
    licenses: licenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;