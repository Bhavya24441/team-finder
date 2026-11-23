const express = require('express');
const TeamRequest = require('../models/TeamRequest');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/skill-demand', requireAuth, async (req, res, next) => {
    try {
        const skills = await TeamRequest.aggregate([
            { $unwind: '$requiredSkills' },
            {
                $project: {
                    skill: { $toLower: { $trim: { input: '$requiredSkills' } } }
                }
            },
            { $match: { skill: { $ne: '' } } },
            { $group: { _id: '$skill', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, skill: '$_id', count: 1 } }
        ]);
        return res.json(skills);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;