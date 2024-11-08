const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Parking = require('../models/Parking');
const Feedback = require('../models/Feedback');

// Get system reports
router.get('/summary', auth, async (req, res) => {
    try {
        const [totalRevenue, totalParkings, totalFeedbacks] = await Promise.all([
            Parking.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$cost' } } }
            ]),
            Parking.countDocuments(),
            Feedback.countDocuments()
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            totalParkings,
            totalFeedbacks
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

module.exports = router; 