const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    projectTitle: { type: String, trim: true, maxlength: 120 },
    teamRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamRequest',
        required: true,
        unique: true
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Team', teamSchema);
