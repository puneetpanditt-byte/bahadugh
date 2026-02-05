const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token or user not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

// Middleware to authenticate user for web routes (sets req.user)
const authenticateWeb = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
            req.user = user;
            res.locals.user = user;
        }
        
        next();
    } catch (error) {
        // Clear invalid token
        res.clearCookie('token');
        next();
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Middleware to check if user is admin or editor
const requireEditor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. Authentication required.'
        });
    }

    if (!['admin', 'editor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Editor privileges required.'
        });
    }

    next();
};

// Middleware to check if user can edit article
const canEditArticle = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. Authentication required.'
        });
    }

    if (!req.user.canEditArticle()) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Insufficient privileges.'
        });
    }

    next();
};

// Middleware to check if user can delete article
const canDeleteArticle = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. Authentication required.'
        });
    }

    if (!req.user.canDeleteArticle()) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Middleware to check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceField = 'user') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. Authentication required.'
            });
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        const resource = req[resourceField] || req.body[resourceField];
        if (resource && resource.toString() === req.user._id.toString()) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'Access denied. You can only access your own resources.'
        });
    };
};

// Middleware to check if user is authenticated for web routes
const requireAuthWeb = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login?error=Please login to access this page');
    }
    next();
};

// Middleware to check if user is admin for web routes
const requireAdminWeb = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/admin/login?error=Please login to access admin panel');
    }

    if (req.user.role !== 'admin') {
        return res.redirect('/?error=Access denied. Admin privileges required.');
    }

    next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                req.user = user;
                res.locals.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

module.exports = {
    authenticate,
    authenticateWeb,
    requireAdmin,
    requireEditor,
    canEditArticle,
    canDeleteArticle,
    requireOwnershipOrAdmin,
    requireAuthWeb,
    requireAdminWeb,
    optionalAuth
};
