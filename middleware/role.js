function requireRole(role) {
    return function (req, res, next) {
       if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'User info missing' });
         }
      if (req.user.role.toLowerCase() !== role.toLowerCase()) {
        return res.status(403).json({ error: 'Access forbidden: insufficient rights' });
      }
      next();
    };
  }
  
  module.exports = requireRole;
  