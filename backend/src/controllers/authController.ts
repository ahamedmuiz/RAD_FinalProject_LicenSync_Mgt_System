import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail'; 

// to generate a short-lived JWT
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '15m', 
  });
};

// to generate a long-lived HTTP-Only Refresh Token
const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d', 
  });
};

// @desc    Register a new user (Mainly used for initial setup right now)
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, companyId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'CLIENT',
      companyId: companyId || null,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // 1. Generate the 7-day refresh token
      const refreshToken = generateRefreshToken(user._id.toString());
      
      // 2. Attach it as an HTTP-Only cookie (Cross-Domain Safe!)
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,            // CRITICAL: Required for cross-domain cookies
        sameSite: 'none',        // CRITICAL: Tells the browser this cookie can be sent across domains (Vercel -> Render)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      // 3. Send the normal short-lived access token to the frontend
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change User Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req: any, res: any): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify the current (temporary) password is correct
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      user.mustChangePassword = false; // They have successfully changed it!
      await user.save();

      // Return fresh user data with the updated flag
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        token: req.headers.authorization.split(' ')[1] // Keep the current token
      });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token silently
// @route   GET /api/auth/refresh
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.jwt;

    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token found in cookies' });
      return;
    }

    // Verify the cookie token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Issue a brand new 15-minute access token!
    res.json({
      token: generateToken(user._id.toString(), user.role)
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
};

// @desc    Logout user & destroy cookie
// @route   POST /api/auth/logout
export const logoutUser = (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,       // Must match login options to delete properly
    sameSite: 'none',   // Must match login options to delete properly
    expires: new Date(0), // Instantly expire the cookie
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot Password - Send Email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ message: 'There is no user with that email address.' });
      return;
    }

    // Generate a temporary reset token (Valid for 15 mins)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    
    // Create the reset URL dynamically based on environment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <h2>LicenSync Password Reset</h2>
      <p>You requested a password reset. Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p><em>This link is valid for 15 minutes.</em></p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'LicenSync - Password Reset Token',
      html: message,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify the token from the URL
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    if (!token) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Update the password
    user.password = req.body.password;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};