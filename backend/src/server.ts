import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

// Route Imports
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import licenseRoutes from './routes/licenseRoutes';

// Load environment variables
dotenv.config();

//--------------|

console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD);
console.log('Length:', process.env.GMAIL_APP_PASSWORD?.length);
//----------|
// Connect to MongoDB
connectDB();

const app = express();

// // Global Middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Your Vite frontend
//   credentials: true,               // Allow HTTP-only cookies
// }));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logger Middleware (Invaluable for debugging)
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url}`);
  next();
});

console.log("--> Registering API Routes...");

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/licenses', licenseRoutes);

// Basic route to test the server health
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ message: 'LicenSync API is running successfully.' });
});

// Fallback Port (Make sure your .env has PORT=5005 if you are still bypassing the ghost process)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});