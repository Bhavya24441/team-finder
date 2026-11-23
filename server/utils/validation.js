const mongoose = require('mongoose');

function normalizeList(value, maxItems = 30) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const result = [];

    for (const item of value) {
        if (typeof item !== 'string') continue;
        const cleaned = item.trim().replace(/\s+/g, ' ');
        const key = cleaned.toLowerCase();
        if (!cleaned || cleaned.length > 60 || seen.has(key)) continue;
        seen.add(key);
        result.push(cleaned);
        if (result.length >= maxItems) break;
    }
    return result;
}

function isValidEmail(value) {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidObjectId(value) {
    return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

module.exports = { normalizeList, isValidEmail, isValidObjectId };