import { Request, Response } from 'express';
import { registerService, loginService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  // DEBUG: Log incoming registration
  // console.log('[CONTROLLER] Register:', email);

  if (!name || !email || !password) {
    sendError(res, 'Name, email and password are required', 400);
    return;
  }

  if (password.length < 6) {
    sendError(res, 'Password must be at least 6 characters', 400);
    return;
  }

  try {
    const result = await registerService({ name, email, password });
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    sendError(res, message, 400, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  // DEBUG: Log incoming login
  // console.log('[CONTROLLER] Login:', email);

  if (!email || !password) {
    sendError(res, 'Email and password are required', 400);
    return;
  }

  try {
    const result = await loginService({ email, password });
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    sendError(res, message, 401, error);
  }
};
