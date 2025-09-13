const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Nominee = require('../models/nominee');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); 
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const protectNominee = async (req, res, next) => {
    let token;

    console.log('Nominee auth middleware called');
    console.log('Authorization header:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token.substring(0, 50) + '...');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', decoded);
            
            req.nominee = await Nominee.findById(decoded.id).select('-password');
            console.log('Nominee found:', req.nominee ? 'Yes' : 'No');

            if (!req.nominee) {
                console.log('Nominee not found in database');
                return res.status(401).json({ message: 'Not authorized, nominee not found' });
            }

            console.log('Nominee authentication successful');
            next(); 
        } catch (error) {
            console.error('Nominee auth error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No authorization header found');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect, protectNominee };

