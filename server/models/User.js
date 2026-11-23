const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 254,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    passwordHash: { type: String, required: true, select: false },
    sapId: { type: String, trim: true, maxlength: 40 },
    skills: [{ type: String, trim: true, maxlength: 60 }],
    interests: [{ type: String, trim: true, maxlength: 60 }],
    availability: {
        type: String,
        enum: ['Weekends', 'Evenings', 'Full-time', 'Flexible', 'Not specified'],
        default: 'Not specified'
    },
    bio: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('User', userSchema);
