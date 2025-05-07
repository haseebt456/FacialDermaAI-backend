const multer = require('multer');
const path = require('path');
const Analysis = require('../models/Analysis');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.single('image'); // 'image' is the field name

// Upload image and analyze (mock AI for now)
exports.uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    // TODO: Call your AI model here and get result
    const aiResult = "Mock diagnosis: acne"; // Replace with real AI call

    // Save analysis to DB
    const analysis = new Analysis({
      user: req.user.id,
      imageUrl: req.file.path,
      result: aiResult
    });

    await analysis.save();

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get analyses for current patient
exports.getOwnAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all analyses (for dermatologists)
exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Dermatologist adds comment
exports.addComment = async (req, res) => {
  try {
    const { analysisId, text } = req.body;
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    analysis.comments.push({ text, dermatologist: req.user.id });
    await analysis.save();

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
