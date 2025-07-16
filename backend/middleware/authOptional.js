import jwt from 'jsonwebtoken';

export const authOptionalMiddleware = (req, res, next) => {
  console.log('🔐 [AUTH OPTIONAL] Starting optional authentication check:', {
    method: req.method,
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 [AUTH OPTIONAL] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      console.log('🔐 [AUTH OPTIONAL] Token extracted, verifying...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'QV7OgvWxIrNSvfjdIZQEEAFQ5hb9mFGskyJTr8/FsUJ8wkwC2s2UJydzt2/aAWx/HxgbtEUdnYIpOcKgVwy81A==');
      req.user = decoded;
      console.log('✅ [AUTH OPTIONAL] Token verified successfully:', {
        student_id: decoded.student_id,
        username: decoded.username,
        is_admin: decoded.is_admin,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
    } else {
      console.log('🔐 [AUTH OPTIONAL] No token provided, proceeding as guest');
    }
  } catch (error) {
    // In optional auth, we don't throw errors, we just don't set req.user
    // This allows public access while still identifying logged-in users
    console.log('❌ [AUTH OPTIONAL] Invalid token provided, proceeding as guest:', error.message);
  }
  next();
};
