const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes imports
const userRoutes = require('./routes/userRoutes');
const qcmRoutes = require('./routes/qcmRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/qcms', qcmRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/subjects', subjectRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));