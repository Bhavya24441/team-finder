const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
}, { _id: false });

const invitationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    invitedAt: { type: Date, default: Date.now }
}, { _id: false });

const teamRequestSchema = new mongoose.Schema({
    projectTitle: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    requiredSkills: [{ type: String, trim: true, maxlength: 60 }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    applicants: { type: [applicantSchema], default: [] },
    invitations: { type: [invitationSchema], default: [] }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

teamRequestSchema.index({ status: 1, createdAt: -1 });
teamRequestSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
