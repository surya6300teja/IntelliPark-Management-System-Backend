const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Submit feedback
router.post('/', auth, async (req, res) => {
    try {
        // Validate required fields
        const { name, email, category, message } = req.body;
        
        if (!name || !email || !category || !message) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        // Log the incoming data
        console.log('Received feedback data:', {
            name,
            email,
            category,
            message,
            userId: req.user.userId
        });

        // Create new feedback
        const feedback = new Feedback({
            name,
            email,
            category,
            message,
            userId: req.user.userId
        });

        // Save to database
        const savedFeedback = await feedback.save();
        console.log('Feedback saved successfully:', savedFeedback);

        res.status(201).json(savedFeedback);
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: error.message 
            });
        }
        res.status(500).json({ 
            message: 'Error submitting feedback',
            details: error.message
        });
    }
});

// Get all feedbacks
router.get('/', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ 
            message: 'Error fetching feedbacks',
            details: error.message 
        });
    }
});

module.exports = router; 