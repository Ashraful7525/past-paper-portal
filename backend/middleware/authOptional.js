import jwt from 'jsonwebtoken';

export const authOptionalMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'QV7OgvWxIrNSvfjdIZQEEAFQ5hb9mFGskyJTr8/FsUJ8wkwC2s2UJydzt2/aAWx/HxgbtEUdnYIpOcKgVwy81A==');
      req.user = decoded;
    }
  } catch (error) {
    // In optional auth, we don't throw errors, we just don't set req.user
    // This allows public access while still identifying logged-in users
    console.log('Optional auth: Invalid token provided, proceeding as guest.');
  }
  next();
};
