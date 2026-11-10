const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// SIGN UP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, sapId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please fill all required fields'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'An account with this email already exists'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            passwordHash,
            sapId
        });

        await newUser.save();

        res.status(201).json({
            message: 'Account created successfully'
        });

    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});


// LOG IN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        req.session.userId = user._id;
        req.session.name = user.name;

        res.json({
            message: 'Login successful',
            name: user.name
        });

    } catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});


// LOG OUT
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');

        res.json({
            message: 'Logged out successfully'
        });
    });
});


module.exports = router;