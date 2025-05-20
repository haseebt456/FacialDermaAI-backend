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
    lowercase: true,
    validate: {
  validator: function(v) {
    return /^\S+@\S+\.\S+$/.test(v); // basic email format
  },
  message: props => `${props.value} is not a valid email address`
}
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
