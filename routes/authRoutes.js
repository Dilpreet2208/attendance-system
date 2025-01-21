const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const nodemailer = require('nodemailer');

const router = express.Router();


// Register User 
router.post('/register', 
  async (req, res) => { const { name, username, password } = req.body; 
  try { const hashedPassword = await bcrypt.hash(password, 10); 
  const user = await User.create({ name, username, password: hashedPassword }); 
  res.status(201).send('User registered'); 
} catch (err) { 
  res.status(400).send(err.message); 
} });

// Login User 
router.post('/login', 
  async (req, res) => { const { username, password } = req.body; 
  const user = await User.findOne({ where: { username } }); 

  if (!user || !(await bcrypt.compare(password, user.password))) { 
    return res.status(401).send('Invalid username or password');
  } 
  req.session.user = user; 
  res.send('Login successful'); 
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).send('User not found');

    // Generate a reset token
    const token = jwt.sign({ username }, 'reset-secret', { expiresIn: '15m' });

    // Configure nodemailer to send the reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'your-email@gmail.com', pass: 'your-email-password' },
    });

    // Send the email with the reset link
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: user.username, // Assuming username is the user's email
      subject: 'Password Reset',
      text: `Reset link: http://localhost:3000/auth/reset-password?token=${token}`,
    });

    res.send('Password reset link sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending password reset link');
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const { username } = jwt.verify(token, 'reset-secret');

    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).send('User not found');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.send('Password reset successful');
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid or expired token');
  }
});

// Mark Attendance Route
router.post('/attendance/mark', async (req, res) => {
  try{
    if (!req.session.user) return res.status(401).send('Not logged in');

    const user = req.session.user;
    const loginTime = new Date();

    // Save attendance
    const attendance = await Attendance.create({
      username: user.username,
      date: loginTime.toISOString().split('T')[0], // Date part only
      loginTime: loginTime.toISOString().split('T')[1], // Time part only
      createdAt: loginTime,
      updatedAt: loginTime,
    });

    res.send({ message: 'Attendance marked', attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).send('Error marking attendance');
  }
});

// Sign Off Route
router.post('/attendance/signoff', async (req, res) => {
  if (!req.session.user) return res.status(401).send('Not logged in');

  const user = req.session.user;
  const signOffTime = new Date();

  // Find today's attendance and update sign off time
  const attendance = await Attendance.findOne({
    where: {
      username: user.username,
      date: signOffTime.toISOString().split('T')[0], // Date part only
    },
  });

  if (!attendance) return res.status(404).send('Attendance not found');

  attendance.signOffTime = signOffTime.toISOString().split('T')[1]; // Time part only
  await attendance.save();

  res.send({ message: 'Sign-off recorded', attendance });
});

router.post('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Failed to logout');
    }

    // Clear the session cookie
    res.clearCookie('connect.sid');
    res.send('Logged out successfully');
  });
});



module.exports = router;
