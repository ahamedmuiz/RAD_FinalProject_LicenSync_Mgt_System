"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
// Route Imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const licenseRoutes_1 = __importDefault(require("./routes/licenseRoutes"));
// Load environment variables
dotenv_1.default.config();
//--------------|
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD);
console.log('Length:', process.env.GMAIL_APP_PASSWORD?.length);
//----------|
// Connect to MongoDB
(0, db_1.default)();
const app = (0, express_1.default)();
// Global Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Your Vite frontend
    credentials: true, // Allow HTTP-only cookies
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Request Logger Middleware (Invaluable for debugging)
app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.url}`);
    next();
});
console.log("--> Registering API Routes...");
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/licenses', licenseRoutes_1.default);
// Basic route to test the server health
app.get('/api/status', (req, res) => {
    res.json({ message: 'LicenSync API is running successfully.' });
});
// Fallback Port (Make sure your .env has PORT=5005 if you are still bypassing the ghost process)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
