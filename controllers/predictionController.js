
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Prediction = require('../models/Prediction');

// Predict and Save via Flask
exports.predictAndSave = async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Image file is missing or invalid.' });
    }

    // 1. Send image to Flask API
    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    const flaskRes = await axios.post('http://localhost:8000/predict', form, {
      headers: form.getHeaders(),
    });

    const { predicted_label, confidence_score, image_filename } = flaskRes.data;
    const image_url = `${req.protocol}://${req.get('host')}/uploads/${flaskRes.data.image_filename}`;

    // 2. Save to MongoDB
    const prediction = new Prediction({
      userId: req.user.id,
      result: {
        predicted_label,
        confidence_score: parseFloat(confidence_score),
      },
      imageUrl: image_url
    });

    await prediction.save();

    // 3. Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }


    res.status(200).json({ predicted_label, confidence_score, image_url });
  } catch (error) {
    console.error('Prediction error:', {
      message: error.message,
      axiosResponse: error.response?.data,
      status: error.response?.status,
    });

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error:
        error.response?.data?.error ||
        error.message ||
        'Failed to predict image',
    });
  }
};

// Retrieve user's predictions
exports.getPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Fetch Prediction Error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
};
