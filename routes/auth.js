const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup route with better error handling
router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body); // Debug log

        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide all required fields' 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save user
        await user.save();
        console.log('User created successfully:', user.email); // Debug log

        res.status(201).json({ 
            message: 'User created successfully',
            userId: user._id 
        });

    } catch (error) {
        console.error('Signup error:', error); // Debug log
        res.status(500).json({ 
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route with better error handling
router.post('/login', async (req, res) => {
    try {
        console.log('Received login request:', req.body.email); // Debug log

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide email and password' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: 'User not found' 
            });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ 
                message: 'Invalid password' 
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        console.log('Login successful:', user.email); // Debug log

        res.json({ 
            token, 
            name: user.name,
            email: user.email 
        });

    } catch (error) {
        console.error('Login error:', error); // Debug log
        res.status(500).json({ 
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
