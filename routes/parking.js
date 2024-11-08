const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Parking = require('../models/Parking');

// Get active parkings (for all users)
router.get('/active', auth, async (req, res) => {
    try {
        console.log('Fetching all active parkings');
        
        const activeParking = await Parking.find({ 
            status: 'active'
        }).sort({ entryTime: -1 });

        console.log('Found active parkings:', activeParking);

        res.json({
            activeCount: activeParking.length,
            activeParking
        });
    } catch (error) {
        console.error('Error in /active route:', error);
        res.status(500).json({ message: 'Error fetching active parkings' });
    }
});

// Record vehicle entry
router.post('/entry', auth, async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, entryTime } = req.body;
        
        // Check if vehicle is already parked
        const existingParking = await Parking.findOne({
            vehicleNumber,
            status: 'active'
        });

        if (existingParking) {
            return res.status(400).json({ 
                message: 'Vehicle is already parked' 
            });
        }

        const parking = new Parking({
            vehicleNumber,
            vehicleType,
            entryTime: entryTime || new Date(),
            spotNumber: Math.floor(Math.random() * 100) + 1,
            status: 'active',
            userId: req.user.userId, // Keep track of who recorded the entry
            recordedBy: req.user.name // Optional: store the name of user who recorded
        });

        await parking.save();
        res.status(201).json(parking);
    } catch (error) {
        console.error('Error in /entry route:', error);
        res.status(500).json({ message: 'Error recording entry' });
    }
});

// Record vehicle exit
router.post('/exit', auth, async (req, res) => {
    try {
        const { vehicleNumber, exitTime } = req.body;

        // Find the active parking for this vehicle
        const parking = await Parking.findOne({
            vehicleNumber: vehicleNumber,
            status: 'active'
        });

        if (!parking) {
            return res.status(404).json({ message: 'No active parking found for this vehicle' });
        }

        // Calculate duration and cost
        const entryTime = new Date(parking.entryTime);
        const exitTimeDate = new Date(exitTime);
        
        // Basic validation
        if (exitTimeDate <= entryTime) {
            return res.status(400).json({ message: 'Exit time must be after entry time' });
        }

        // Calculate duration in hours
        const duration = (exitTimeDate - entryTime) / (1000 * 60 * 60);

        // Calculate cost based on vehicle type
        let hourlyRate;
        switch (parking.vehicleType) {
            case 'car':
                hourlyRate = 20;
                break;
            case 'bike':
                hourlyRate = 10;
                break;
            case 'truck':
                hourlyRate = 30;
                break;
            default:
                hourlyRate = 20;
        }

        const cost = Math.ceil(duration * hourlyRate);

        // Update parking record
        parking.exitTime = exitTime;
        parking.status = 'completed';
        parking.duration = duration;
        parking.cost = cost;

        await parking.save();

        res.json({
            message: 'Exit recorded successfully',
            cost: cost,
            duration: duration,
            ...parking.toObject()
        });

    } catch (error) {
        console.error('Error recording exit:', error);
        res.status(500).json({ message: 'Error recording exit' });
    }
});

// Helper function to calculate parking cost
function calculateParkingCost(durationInHours, vehicleType) {
    // Define your rate card
    const rates = {
        car: 20,    // $20 per hour for cars
        bike: 10,   // $10 per hour for bikes
        truck: 30   // $30 per hour for trucks
    };

    const rate = rates[vehicleType] || rates.car; // Default to car rate if type not found
    return Math.ceil(durationInHours * rate); // Round up to nearest dollar
}

// Get parking history (for all users)
router.get('/history', auth, async (req, res) => {
    try {
        console.log('Fetching complete parking history');

        const parkingHistory = await Parking.find({ 
            status: 'completed'
        })
        .sort({ exitTime: -1 }) // Sort by exit time, most recent first
        .populate('userId', 'name'); // Include user name who recorded the entry

        console.log(`Found ${parkingHistory.length} historical records`);

        res.json(parkingHistory);
    } catch (error) {
        console.error('Error fetching parking history:', error);
        res.status(500).json({ message: 'Error fetching parking history' });
    }
});

// Get parking details by vehicle number
router.get('/vehicle/:vehicleNumber', auth, async (req, res) => {
    try {
        const parking = await Parking.findOne({ 
            vehicleNumber: req.params.vehicleNumber,
            status: 'active'
        });

        if (!parking) {
            return res.status(404).json({ 
                message: 'No active parking found for this vehicle' 
            });
        }

        res.json(parking);
    } catch (error) {
        console.error('Error fetching parking details:', error);
        res.status(500).json({ 
            message: 'Error fetching parking details' 
        });
    }
});

module.exports = router;
