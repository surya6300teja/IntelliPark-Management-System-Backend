require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRouter = require('./routes/auth');
const parkingRouter = require('./routes/parking');
const feedbackRouter = require('./routes/feedback');
const reportRouter = require('./routes/reports');

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/parking', parkingRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/reports', reportRouter);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
