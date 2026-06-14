import UserModel from './auth.model';
import { generateToken } from '../../utils/jwt.utils';
import { IRegisterInput, ILoginInput, IAuthResponse } from './auth.interface';

export const registerService = async (input: IRegisterInput): Promise<IAuthResponse> => {
  const { name, email, password } = input;

  // DEBUG: Log registration attempt
  // console.log('[AUTH] Register attempt:', email);

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create user (password gets hashed by pre-save hook)
  const user = await UserModel.create({ name, email, password });

  // DEBUG: Log user created
  // console.log('[AUTH] User created:', user._id);

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const loginService = async (input: ILoginInput): Promise<IAuthResponse> => {
  const { email, password } = input;

  // DEBUG: Log login attempt
  // console.log('[AUTH] Login attempt:', email);

  // Find user
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // DEBUG: Log login success
  // console.log('[AUTH] Login successful:', user._id);

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};
