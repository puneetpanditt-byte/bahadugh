const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');
const adminApiRoutes = require('./routes/admin-api');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tiny.cloud"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bahadurgarh-news', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Middleware to pass user data to all templates
app.use(async (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/api', adminApiRoutes);
app.use('/articles', articleRoutes);

// Home page route
app.get('/', async (req, res) => {
    try {
        const Article = require('./models/Article');
        const Category = require('./models/Category');
        
        // Get featured articles
        const featuredArticles = await Article.find({ featured: true, status: 'published' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'name');
        
        // Get latest articles
        const latestArticles = await Article.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('author', 'name');
        
        // Get trending articles (most viewed in last 7 days)
        const trendingArticles = await Article.find({ 
            status: 'published',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .sort({ views: -1 })
            .limit(5)
            .populate('author', 'name');
        
        // Get categories
        const categories = await Category.find({ active: true }).sort({ name: 1 });
        
        res.render('pages/index', {
            featuredArticles,
            latestArticles,
            trendingArticles,
            categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).render('error', { 
            message: 'Error loading page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Article detail page
app.get('/article/:id', async (req, res) => {
    try {
        const Article = require('./models/Article');
        const Comment = require('./models/Comment');
        
        const article = await Article.findById(req.params.id)
            .populate('author', 'name email');
        
        if (!article || article.status !== 'published') {
            return res.status(404).render('error', { 
                message: 'Article not found',
                error: {}
            });
        }
        
        // Increment view count
        article.views = (article.views || 0) + 1;
        await article.save();
        
        // Get related articles
        const relatedArticles = await Article.find({
            _id: { $ne: article._id },
            category: article.category,
            status: 'published'
        })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('author', 'name');
        
        // Get comments
        const comments = await Comment.find({ article: article._id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        
        // Get trending articles
        const trendingArticles = await Article.find({ 
            status: 'published',
            _id: { $ne: article._id }
        })
            .sort({ views: -1 })
            .limit(5)
            .populate('author', 'name');
        
        res.render('pages/article', {
            article,
            relatedArticles,
            comments,
            trendingArticles,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading article:', error);
        res.status(500).render('error', { 
            message: 'Error loading article',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Category page
app.get('/category/:category', async (req, res) => {
    try {
        const Article = require('./models/Article');
        const category = req.params.category;
        
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        
        const articles = await Article.find({ 
            category: category, 
            status: 'published' 
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name');
        
        const total = await Article.countDocuments({ 
            category: category, 
            status: 'published' 
        });
        
        const totalPages = Math.ceil(total / limit);
        
        res.render('pages/category', {
            articles,
            category,
            currentPage: page,
            totalPages,
            total,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading category:', error);
        res.status(500).render('error', { 
            message: 'Error loading category',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Authentication pages
app.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('pages/login', { 
        error: req.query.error,
        message: req.query.message 
    });
});

app.get('/register', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('pages/register', { 
        error: req.query.error,
        message: req.query.message 
    });
});

app.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('pages/profile', { user: req.user });
});

// Admin routes
app.get('/admin/login', (req, res) => {
    if (req.user && req.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { 
        error: req.query.error,
        message: req.query.message 
    });
});

// Error handling middleware
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        error: {}
    });
});

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).render('error', { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

module.exports = app;
