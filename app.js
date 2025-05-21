
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
const userRoutes = require('./routes/userRoute')
app.use(cors());``
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api', sendEmail);
app.use('/uploads', express.static('uploads'));
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);


const upload = multer({ dest: 'uploads/' });


app.get('/', (req, res) => res.send('FacialDerma AI Backend Running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
