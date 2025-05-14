const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const analysisCtrl = require('../controllers/analysisController');

router.post(
  '/upload',
  auth,
  requireRole('patient'),
  analysisCtrl.uploadMiddleware,
  analysisCtrl.uploadAndAnalyze
);

router.get('/mine', auth, requireRole('patient'), analysisCtrl.getOwnAnalyses);

router.get('/all', auth, requireRole('dermatologist'), analysisCtrl.getAllAnalyses);

router.post('/comment', auth, requireRole('dermatologist'), analysisCtrl.addComment);

module.exports = router;
