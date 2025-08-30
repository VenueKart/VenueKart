import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function generateAccessToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email 
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}
