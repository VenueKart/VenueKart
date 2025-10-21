import { verifyAccessToken } from '../utils/jwt.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    // Use 401 so clients can trigger refresh token flow automatically
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

export function requireVenueOwner(req, res, next) {
  if (req.user.userType !== 'venue-owner') {
    return res.status(403).json({ error: 'Venue owner access required' });
  }
  next();
}
