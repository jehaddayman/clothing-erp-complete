import { User, IUser, UserRole } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';

interface AuthResult {
  user: Pick<IUser, 'id' | 'name' | 'email' | 'role'> & { id: string };
  accessToken: string;
  refreshToken: string;
}

const sanitizeUser = (user: IUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role?: UserRole
): Promise<AuthResult> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role: role || 'sales_employee' });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const refreshAccessToken = async (
  token: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.userId).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    throw ApiError.unauthorized('Refresh token not recognized');
  }

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId: string, token: string): Promise<void> => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  await user.save();
};
