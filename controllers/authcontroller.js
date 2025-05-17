const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.signup = async (req, res) => {
  try {
    const { role, username, email, password } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role,
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

    // ✅ Send email after response
    sendEmail(
      newUser.email,
      'Welcome to FacialDerma AI',
      `<h1>Welcome ${newUser.username}!</h1>
       <p>Thank you for registering with us.</p>
       <p>Your account has been created successfully as ${newUser.role}!</p>
       <p>Best regards,<br>FacialDerma AI Team</p>`
    ).catch(err => console.error('Signup email error:', err));

    console.log("Register body:", req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password, role } = req.body;

    if (!emailOrUsername || !password || !role) {
      return res.status(400).json({ error: 'All fields are required including role' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role !== role) {
      return res.status(403).json({ error: `Role mismatch. You are registered as a ${user.role}.` });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

    // ✅ Send login notification after response
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    sendEmail(
      user.email,
      'Login Notification',
      `<h1>Login Alert</h1>
      <p>You just logged into your account.</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p>If this wasn't you, please secure your account.</p>`
    ).catch(err => console.error('Login email error:', err));

    // console.log("Login body:", req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
