const express = require('express');
const mongoose = require('mongoose');
const TeamRequest = require('../models/TeamRequest');
const Team = require('../models/Team');
const requireAuth = require('../middleware/auth');
const { normalizeList, isValidObjectId } = require('../utils/validation');

const router = express.Router();

router.use(requireAuth);

router.get('/mine', async (req, res, next) => {
    try {
        const requests = await TeamRequest.find({ createdBy: req.session.userId })
            .populate('applicants.userId', 'name skills availability bio')
            .sort({ createdAt: -1 })
            .lean();
        return res.json(requests);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const projectTitle = typeof req.body.projectTitle === 'string' ? req.body.projectTitle.trim() : '';
        const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
        if (!projectTitle || projectTitle.length > 120 || description.length > 2000) {
            return res.status(400).json({ message: 'Enter a project title (120 characters or fewer) and a description under 2,000 characters.' });
        }

        const requiredSkills = normalizeList(req.body.requiredSkills);
        const request = await TeamRequest.create({
            projectTitle,
            description,
            requiredSkills,
            createdBy: req.session.userId
        });
        const populated = await TeamRequest.findById(request._id).populate('createdBy', 'name').lean();
        return res.status(201).json(populated);
    } catch (error) {
        return next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const requests = await TeamRequest.find({ status: 'open' })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        const currentUserId = req.session.userId.toString();
        const result = requests.map((request) => ({
            ...request,
            isOwner: request.createdBy && request.createdBy._id.toString() === currentUserId,
            hasApplied: (request.applicants || []).some((application) => application.userId.toString() === currentUserId),
            applicationCount: (request.applicants || []).length
        }));
        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

router.post('/:id/apply', async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID.' });

        const request = await TeamRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Team request not found.' });
        if (request.createdBy.toString() === req.session.userId.toString()) {
            return res.status(400).json({ message: 'You cannot apply to your own request.' });
        }
        if (request.status !== 'open') return res.status(409).json({ message: 'This request is closed.' });
        if (request.applicants.some((application) => application.userId.toString() === req.session.userId.toString())) {
            return res.status(409).json({ message: 'You have already applied to this request.' });
        }

        const updated = await TeamRequest.findOneAndUpdate(
            {
                _id: request._id,
                status: 'open',
                applicants: { $not: { $elemMatch: { userId: new mongoose.Types.ObjectId(req.session.userId) } } }
            },
            { $push: { applicants: { userId: req.session.userId } } },
            { new: true }
        );
        if (!updated) return res.status(409).json({ message: 'This request changed or you have already applied.' });
        return res.status(201).json({ message: 'Application submitted successfully.' });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id/respond', async (req, res, next) => {
    const { applicantId, action } = req.body;
    if (!isValidObjectId(req.params.id) || !isValidObjectId(applicantId)) {
        return res.status(400).json({ message: 'Invalid request or applicant ID.' });
    }
    if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Action must be accept or reject.' });
    }

    let session;
    try {
        session = await mongoose.startSession();
        let result;
        await session.withTransaction(async () => {
            const request = await TeamRequest.findOne({
                _id: req.params.id,
                createdBy: req.session.userId,
                'applicants.userId': applicantId,
                'applicants.status': 'pending'
            }).session(session);

            if (!request) {
                const ownedRequest = await TeamRequest.exists({
                    _id: req.params.id,
                    createdBy: req.session.userId
                }).session(session);
                if (!ownedRequest) {
                    const exists = await TeamRequest.exists({ _id: req.params.id }).session(session);
                    const error = new Error(exists ? 'Only the request creator can respond.' : 'Team request not found.');
                    error.status = exists ? 403 : 404;
                    throw error;
                }
                const error = new Error('This application is no longer pending.');
                error.status = 409;
                throw error;
            }

            const newStatus = action === 'accept' ? 'accepted' : 'rejected';
            const updated = await TeamRequest.findOneAndUpdate(
                {
                    _id: request._id,
                    createdBy: req.session.userId,
                    applicants: { $elemMatch: { userId: applicantId, status: 'pending' } }
                },
                { $set: { 'applicants.$.status': newStatus } },
                { new: true, session }
            );
            if (!updated) {
                const error = new Error('This application is no longer pending.');
                error.status = 409;
                throw error;
            }

            let team;
            if (action === 'accept') {
                team = await Team.findOneAndUpdate(
                    { teamRequest: request._id },
                    {
                        $setOnInsert: {
                            name: request.projectTitle,
                            projectTitle: request.projectTitle,
                            teamRequest: request._id,
                            leader: request.createdBy
                        },
                        $addToSet: { members: { $each: [request.createdBy, applicantId] } }
                    },
                    { new: true, upsert: true, runValidators: true, session }
                );
            }
            result = { message: 'Application ' + newStatus + '.', team };
        });
        return res.json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        return next(error);
    } finally {
        if (session) await session.endSession();
    }
});

module.exports = router;