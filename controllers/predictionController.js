// const Prediction = require('../models/Prediction');

// exports.savePrediction = async (req, res) => {
//   try {
//     const { result, imageUrl } = req.body;

//     const prediction = new Prediction({
//       userId: req.user.id,
//       result: {
//         predicted_label,
//         confidence_score,
//       },
//       imageUrl: image_url,
//     });

//     await prediction.save();
//     res.status(201).json({ message: 'Result saved successfully' });

//   } catch (error) {
//     res.status(500).json({ error: 'Failed to save Result' });
//   }
// };

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
