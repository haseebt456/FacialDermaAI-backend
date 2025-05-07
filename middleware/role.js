function requireRole(role) {
    return function (req, res, next) {
      if (req.user.role !== role) {
        return res.status(403).json({ error: 'Access forbidden: insufficient rights' });
      }
      next();
    };
  }
  
  module.exports = requireRole;
  