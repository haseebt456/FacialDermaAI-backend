const express = require('express');
const router = express.Router();
const { getPredictions } = require('../controllers/predictionController');
const {predictAndSave} = require('../controllers/predictionController')
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', auth, getPredictions);
router.post('/predict', auth, upload.single('image'), predictAndSave);

module.exports = router;
