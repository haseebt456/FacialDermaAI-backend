const express = require('express');
const router = express.Router();
const { savePrediction } = require('../controllers/predictionController');
const auth = require('../middleware/auth');

router.post('/save', auth, savePrediction);

module.exports = router;
