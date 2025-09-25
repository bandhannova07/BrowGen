import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  
  // Check for Bearer token first (access token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure it's an access token (not refresh)
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  
  // Check for Bearer token first (access token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  if (!token) {
    // No token provided, continue as anonymous user
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure it's an access token (not refresh)
    if (decoded.type && decoded.type !== 'access') {
      req.user = null;
    } else {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Invalid token, continue as anonymous user
    req.user = null;
    next();
  }
}
