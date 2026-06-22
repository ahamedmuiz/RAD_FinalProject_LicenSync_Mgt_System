import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// 1. Extend the Express Request type so TypeScript knows 'req.user' exists
export interface AuthRequest extends Request {
  user?: IUser;
}

// 2. Middleware to protect routes (Must be logged in)
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // Find the user in DB and attach to request (excluding the password)
      req.user = await User.findById(decoded.id).select('-password') as IUser;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 3. Middleware to check for Project Manager role
export const projectManagerOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'PROJECT_MANAGER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Project Managers only.' });
  }
};