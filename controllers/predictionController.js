const Prediction = require('../models/Prediction');

exports.savePrediction = async (req, res) => {
  try {
    const { result, imageUrl } = req.body;

    if (!result || !result.predicted_label || !result.confidence_score) {
      return res.status(400).json({ error: 'Invalid result data' });
    }

    const prediction = new Prediction({
      userId: req.user.id,
      result: JSON.stringify({
        predicted_label: result.predicted_label,
        confidence_score: result.confidence_score,
      }),
      imageUrl: imageUrl,
    });

    await prediction.save();
    res.status(201).json({ message: 'Result saved successfully' });

  } catch (error) {
    console.error('Save Prediction Error:', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(predictions);
    } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
};


