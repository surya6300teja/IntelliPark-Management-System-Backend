const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['car', 'bike', 'truck']
    },
    spotNumber: {
        type: Number,
        required: true
    },
    entryTime: {
        type: Date,
        required: true
    },
    exitTime: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'completed'],
        default: 'active'
    },
    cost: {
        type: Number
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordedBy: {
        type: String // Name of the user who recorded the entry
    },
    exitRecordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Parking', parkingSchema);
