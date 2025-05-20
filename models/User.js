const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid username. No spaces allowed.`
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient','dermatologist'],
    default: 'patient'
  }
});

module.exports = mongoose.model('User', userSchema);
