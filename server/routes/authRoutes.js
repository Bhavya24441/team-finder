const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isValidEmail } = require('../utils/validation');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        const sapId = typeof req.body.sapId === 'string' ? req.body.sapId.trim() : undefined;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }
        if (name.length > 100 || !isValidEmail(email) || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: 'Enter a valid email, a name under 100 characters, and a password of at least 8 characters.' });
        }
        if (sapId && sapId.length > 40) {
            return res.status(400).json({ message: 'SAP ID must be 40 characters or fewer.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, passwordHash, sapId });
        return res.status(201).json({ message: 'Account created successfully.', userId: user._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Please check the account details and try again.' });
        }
        return next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ message: 'Enter a valid email and password.' });
        }

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        req.session.regenerate((error) => {
            if (error) return next(error);
            req.session.userId = user._id.toString();
            req.session.name = user.name;
            req.session.save((saveError) => {
                if (saveError) return next(saveError);
                return res.json({ message: 'Login successful.', name: user.name });
            });
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/logout', (req, res, next) => {
    if (!req.session) {
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully.' });
    }
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully.' });
    });
});

module.exports = router;