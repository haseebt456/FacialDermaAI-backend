const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const analysisCtrl = require('../controllers/analysisController');

// Patient uploads image for analysis
router.post(
  '/analysis/upload',
  auth,
  requireRole('patient'),
  analysisCtrl.uploadMiddleware,
  analysisCtrl.uploadAndAnalyze
);

// Patient views own analyses
router.get('/mine', auth, requireRole('patient'), analysisCtrl.getOwnAnalyses);

// Dermatologist views all analyses
router.get('/all', auth, requireRole('dermatologist'), analysisCtrl.getAllAnalyses);

// Dermatologist adds comment
router.post('/comment', auth, requireRole('dermatologist'), analysisCtrl.addComment);

module.exports = router;
