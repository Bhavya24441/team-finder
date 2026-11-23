require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const TeamRequest = require('../models/TeamRequest');

const demoPassword = 'TeamFinderDemo2026!';
const demoUsers = [
    {
        name: 'Alex Rivera',
        email: 'demo.alex@example.com',
        skills: ['JavaScript', 'Node.js', 'MongoDB', 'React'],
        interests: ['Full-stack apps', 'EdTech', 'Hackathons'],
        availability: 'Evenings',
        bio: 'Demo student focused on building practical full-stack tools for campus life.'
    },
    {
        name: 'Jordan Kim',
        email: 'demo.jordan@example.com',
        skills: ['UI/UX', 'Figma', 'HTML', 'CSS', 'JavaScript'],
        interests: ['Accessible design', 'Prototyping', 'Education'],
        availability: 'Weekends',
        bio: 'Demo student who turns early ideas into clear, accessible interfaces.'
    },
    {
        name: 'Priya Shah',
        email: 'demo.priya@example.com',
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'MongoDB'],
        interests: ['AI for learning', 'Data visualization', 'Research'],
        availability: 'Flexible',
        bio: 'Demo student interested in data-driven features and responsible AI.'
    },
    {
        name: 'Noah Williams',
        email: 'demo.noah@example.com',
        skills: ['React', 'Node.js', 'CSS', 'API Design'],
        interests: ['Web apps', 'Open source', 'Product building'],
        availability: 'Evenings',
        bio: 'Demo student who enjoys connecting polished frontends to reliable APIs.'
    }
];

const demoRequests = [
    {
        ownerEmail: 'demo.alex@example.com',
        projectTitle: 'Campus Event Planner',
        description: 'Build a simple app for students to discover campus events and coordinate attendance.',
        requiredSkills: ['JavaScript', 'React', 'UI/UX']
    },
    {
        ownerEmail: 'demo.jordan@example.com',
        projectTitle: 'Study Buddy Match App',
        description: 'Help students form study groups based on courses, interests, and weekly availability.',
        requiredSkills: ['Node.js', 'MongoDB', 'HTML', 'CSS']
    },
    {
        ownerEmail: 'demo.priya@example.com',
        projectTitle: 'Campus Sustainability Dashboard',
        description: 'Explore campus energy and recycling data in a clear dashboard with useful trends.',
        requiredSkills: ['Python', 'Data Analysis', 'JavaScript']
    }
];

async function seedDemoData() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI must be set in server/.env before seeding.');

    await mongoose.connect(mongoUri);
    const passwordHash = await bcrypt.hash(demoPassword, 12);

    for (const user of demoUsers) {
        await User.updateOne(
            { email: user.email },
            { $set: { ...user, passwordHash } },
            { upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        console.log(`Ready: ${user.name} (${user.email})`);
    }

    for (const request of demoRequests) {
        const owner = await User.findOne({ email: request.ownerEmail }).select('_id').lean();
        if (!owner) throw new Error(`Missing demo request owner: ${request.ownerEmail}`);
        await TeamRequest.updateOne(
            { projectTitle: request.projectTitle, createdBy: owner._id },
            { $set: {
                projectTitle: request.projectTitle,
                description: request.description,
                requiredSkills: request.requiredSkills,
                createdBy: owner._id,
                status: 'open'
            } },
            { upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        console.log(`Ready request: ${request.projectTitle} (${request.ownerEmail})`);
    }

    const demoInvitations = [
        { ownerEmail: 'demo.alex@example.com', projectTitle: 'Campus Event Planner', recipientEmail: 'demo.noah@example.com' },
        { ownerEmail: 'demo.priya@example.com', projectTitle: 'Campus Sustainability Dashboard', recipientEmail: 'demo.noah@example.com' },
        { ownerEmail: 'demo.jordan@example.com', projectTitle: 'Study Buddy Match App', recipientEmail: 'demo.alex@example.com' },
        { ownerEmail: 'demo.alex@example.com', projectTitle: 'Campus Event Planner', recipientEmail: 'demo.priya@example.com' },
        { ownerEmail: 'demo.priya@example.com', projectTitle: 'Campus Sustainability Dashboard', recipientEmail: 'demo.jordan@example.com' }
    ];
    for (const invitation of demoInvitations) {
        const owner = await User.findOne({ email: invitation.ownerEmail }).select('_id').lean();
        const recipient = await User.findOne({ email: invitation.recipientEmail }).select('_id').lean();
        if (!owner || !recipient) throw new Error(`Missing demo invitation account for ${invitation.projectTitle}`);
        const request = await TeamRequest.findOne({ projectTitle: invitation.projectTitle, createdBy: owner._id });
        if (!request) throw new Error(`Missing demo request: ${invitation.projectTitle}`);
        await TeamRequest.findOneAndUpdate(
            { _id: request._id, invitations: { $not: { $elemMatch: { userId: recipient._id } } } },
            { $push: { invitations: { userId: recipient._id, status: 'pending' } } }
        );
        console.log(`Ready invitation: ${invitation.projectTitle} -> ${invitation.recipientEmail}`);
    }
    console.log(`Demo data is ready. Shared demo password: ${demoPassword}`);
}

seedDemoData()
    .catch((error) => {
        console.error('Could not seed demo data:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });