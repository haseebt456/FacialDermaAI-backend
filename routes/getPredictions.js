const express = require('express');
const router = express.Router();
const { getUserPredictions } = require('../controllers/predictionController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, getUserPredictions);

module.exports = router;
