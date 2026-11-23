require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;
const port = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
if (isProduction) app.set('trust proxy', 1);

const allowedOrigins = new Set([
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()) : [])
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

if (!mongoUri || !sessionSecret) {
    throw new Error('MONGO_URI and SESSION_SECRET must be set in the server environment.');
}

app.use(session({
    name: 'connect.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax'
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => res.send('Team Finder API is running.'));
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.name === 'ValidationError' || error.name === 'CastError' || error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Please check the request and try again.' });
    }
    if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
    console.error('Request failed:', error.name || 'Error');
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function start() {
    try {
        await mongoose.connect(mongoUri);
        const server = app.listen(port, () => {
            console.log('MongoDB connected successfully.');
            console.log('Team Finder API listening on port ' + port + '.');
        });
        return server;
    } catch (error) {
        console.error('Unable to start the API:', error.name || 'database connection error');
        process.exitCode = 1;
        return null;
    }
}

if (require.main === module) start();

module.exports = { app, start };