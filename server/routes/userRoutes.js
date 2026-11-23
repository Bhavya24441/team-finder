const express = require('express');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const { normalizeList } = require('../utils/validation');

const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('name email sapId skills interests availability bio createdAt')
            .lean();
        if (!user) return res.status(401).json({ message: 'Please log in to continue.' });
        return res.json(user);
    } catch (error) {
        return next(error);
    }
});

router.put('/me', requireAuth, async (req, res, next) => {
    try {
        const updates = {};
        if (Object.prototype.hasOwnProperty.call(req.body, 'bio')) {
            if (typeof req.body.bio !== 'string' || req.body.bio.trim().length > 500) {
                return res.status(400).json({ message: 'Bio must be 500 characters or fewer.' });
            }
            updates.bio = req.body.bio.trim();
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'skills')) {
            if (!Array.isArray(req.body.skills)) return res.status(400).json({ message: 'Skills must be a list.' });
            updates.skills = normalizeList(req.body.skills);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'interests')) {
            if (!Array.isArray(req.body.interests)) return res.status(400).json({ message: 'Interests must be a list.' });
            updates.interests = normalizeList(req.body.interests);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'availability')) {
            const validAvailability = ['Weekends', 'Evenings', 'Full-time', 'Flexible', 'Not specified'];
            if (!validAvailability.includes(req.body.availability)) {
                return res.status(400).json({ message: 'Choose a valid availability option.' });
            }
            updates.availability = req.body.availability;
        }

        const user = await User.findByIdAndUpdate(req.session.userId, { $set: updates }, {
            new: true,
            runValidators: true
        }).select('name email sapId skills interests availability bio createdAt').lean();
        if (!user) return res.status(401).json({ message: 'Please log in to continue.' });
        return res.json(user);
    } catch (error) {
        return next(error);
    }
});

router.get('/search', requireAuth, async (req, res, next) => {
    try {
        const rawSkills = typeof req.query.skills === 'string'
            ? req.query.skills.split(',')
            : [];
        const requestedSkills = normalizeList(rawSkills);
        if (requestedSkills.length === 0) return res.json([]);

        const skillKeys = requestedSkills.map((skill) => skill.toLowerCase());
        const users = await User.find({ _id: { $ne: req.session.userId } })
            .select('name skills availability bio')
            .lean();

        const results = users.map((user) => {
            const userSkillKeys = new Set((user.skills || []).map((skill) => skill.trim().toLowerCase()));
            const matchedSkills = skillKeys.filter((skill) => userSkillKeys.has(skill)).length;
            return {
                _id: user._id,
                name: user.name,
                skills: user.skills || [],
                availability: user.availability,
                bio: user.bio,
                matchCount: matchedSkills,
                matchPercent: Math.round((matchedSkills / skillKeys.length) * 100)
            };
        }).filter((user) => user.matchCount > 0)
            .sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount || a.name.localeCompare(b.name));

        return res.json(results);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;