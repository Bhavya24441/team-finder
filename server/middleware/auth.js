function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }

    return res.status(401).json({ message: 'Please log in to continue.' });
}

module.exports = requireAuth;
