const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./db');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'attendance-secret', resave: false, saveUninitialized: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: 'BMW-MOTORSPORT',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);


sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch(err => console.error('Database sync error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
