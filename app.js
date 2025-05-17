const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictionRoutes');
const sendEmail = require('./utils/sendEmail');
const app = express();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api', sendEmail);
app.use('/uploads', express.static('uploads'));
app.use('/api/predictions', predictionRoutes);

const upload = multer({ dest: 'uploads/' });

app.post('/api/analysis/predict', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const form = new FormData();

    form.append('image', fs.createReadStream(req.file.path), req.file.originalname);

    const response = await axios.post('http://localhost:8000/predict', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    fs.unlinkSync(req.file.path);

    return res.json(response.data);

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error forwarding to Flask API:', error.message);
    return res.status(500).json({ error: 'Prediction failed' });
  }
});

app.get('/', (req, res) => res.send('FacialDerma AI Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
