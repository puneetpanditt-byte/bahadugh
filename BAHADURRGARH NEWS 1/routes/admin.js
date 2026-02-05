const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article');
const User = require('../models/User');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { 
    authenticate, 
    requireAdmin, 
    requireEditor,
    requireAuthWeb,
    requireAdminWeb 
} = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to check admin authentication for all admin routes
router.use(authenticateWeb);

// GET /admin/dashboard - Admin dashboard
router.get('/dashboard', requireAdminWeb, async (req, res) => {
    try {
        // Get statistics
        const [
            totalArticles,
            totalUsers,
            totalComments,
            totalViews,
            publishedArticles,
            draftArticles
        ] = await Promise.all([
            Article.countDocuments(),
            User.countDocuments({ isActive: true }),
            Comment.countDocuments({ status: 'approved' }),
            Article.aggregate([
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]),
            Article.countDocuments({ status: 'published' }),
            Article.countDocuments({ status: 'draft' })
        ]);

        const stats = {
            totalArticles,
            totalUsers,
            totalComments,
            totalViews: totalViews[0]?.total || 0,
            publishedArticles,
            draftArticles
        };

        // Get latest articles
        const latestArticles = await Article.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'name');

        // Get recent activities (mock data for now)
        const recentActivities = [
            {
                type: 'article_created',
                description: 'New article "Breaking News: Major Policy Update" was created',
                createdAt: new Date()
            },
            {
                type: 'user_registered',
                description: 'New user "John Doe" registered',
                createdAt: new Date(Date.now() - 3600000)
            },
            {
                type: 'comment_added',
                description: 'New comment was added to "Technology Trends 2024"',
                createdAt: new Date(Date.now() - 7200000)
            }
        ];

        // Get trending articles
        const trendingArticles = await Article.getTrending(7, 5);

        res.render('admin/dashboard', {
            user: req.user,
            stats,
            latestArticles,
            recentActivities,
            trendingArticles
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /admin/articles - Articles management
router.get('/articles', requireAuthWeb, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filters
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.search) {
            filters.$text = { $search: req.query.search };
        }

        // Date range filter
        if (req.query.dateFrom || req.query.dateTo) {
            filters.createdAt = {};
            if (req.query.dateFrom) {
                filters.createdAt.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                filters.createdAt.$lte = new Date(req.query.dateTo);
            }
        }

        const articles = await Article.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name');

        const totalArticles = await Article.countDocuments(filters);

        res.render('admin/articles', {
            user: req.user,
            articles,
            totalArticles,
            currentPage: page,
            totalPages: Math.ceil(totalArticles / limit)
        });
    } catch (error) {
        console.error('Articles error:', error);
        res.status(500).render('error', { 
            message: 'Error loading articles',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /admin/articles/new - Create new article form
router.get('/articles/new', requireAuthWeb, (req, res) => {
    res.render('admin/create-article', {
        user: req.user,
        article: null
    });
});

// GET /admin/articles/edit/:id - Edit article form
router.get('/articles/edit/:id', requireAuthWeb, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).render('error', { 
                message: 'Article not found',
                error: {}
            });
        }

        res.render('admin/create-article', {
            user: req.user,
            article
        });
    } catch (error) {
        console.error('Edit article error:', error);
        res.status(500).render('error', { 
            message: 'Error loading article',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// POST /admin/articles - Create new article
router.post('/articles', authenticate, requireEditor, upload.single('image'), async (req, res) => {
    try {
        const articleData = {
            ...req.body,
            author: req.user.name,
            publishDate: new Date(req.body.publishDate || Date.now())
        };

        // Handle image upload
        if (req.file) {
            articleData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Process tags
        if (req.body.tags) {
            articleData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Convert checkboxes to boolean
        articleData.featured = !!req.body.featured;
        articleData.breakingNews = !!req.body.breakingNews;
        articleData.allowComments = req.body.allowComments !== 'false';

        const article = new Article(articleData);
        await article.save();

        res.json({
            success: true,
            message: 'Article created successfully',
            data: article
        });
    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create article'
        });
    }
});

// PUT /admin/articles/:id - Update article
router.put('/articles/:id', authenticate, requireEditor, upload.single('image'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Article not found'
            });
        }

        // Update article data
        const updateData = {
            ...req.body,
            publishDate: new Date(req.body.publishDate || article.publishDate)
        };

        // Handle image upload
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Process tags
        if (req.body.tags) {
            updateData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Convert checkboxes to boolean
        updateData.featured = !!req.body.featured;
        updateData.breakingNews = !!req.body.breakingNews;
        updateData.allowComments = req.body.allowComments !== 'false';

        Object.assign(article, updateData);
        await article.save();

        res.json({
            success: true,
            message: 'Article updated successfully',
            data: article
        });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update article'
        });
    }
});

// DELETE /admin/articles/:id - Delete article
router.delete('/articles/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Article not found'
            });
        }

        await Article.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete article'
        });
    }
});

// POST /admin/articles/bulk-action - Bulk actions on articles
router.post('/articles/bulk-action', authenticate, requireEditor, async (req, res) => {
    try {
        const { action, articleIds } = req.body;

        if (!action || !articleIds || articleIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Action and article IDs are required'
            });
        }

        let updateData = {};
        
        switch (action) {
            case 'publish':
                updateData = { status: 'published' };
                break;
            case 'draft':
                updateData = { status: 'draft' };
                break;
            case 'archive':
                updateData = { status: 'archived' };
                break;
            case 'delete':
                if (req.user.role !== 'admin') {
                    return res.status(403).json({
                        success: false,
                        error: 'Only admins can delete articles'
                    });
                }
                await Article.deleteMany({ _id: { $in: articleIds } });
                return res.json({
                    success: true,
                    message: `${articleIds.length} articles deleted successfully`
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }

        const result = await Article.updateMany(
            { _id: { $in: articleIds } },
            updateData
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} articles ${action}d successfully`
        });
    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform bulk action'
        });
    }
});

// GET /admin/categories - Categories management
router.get('/categories', requireAuthWeb, async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 });
        
        res.render('admin/categories', {
            user: req.user,
            categories
        });
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).render('error', { 
            message: 'Error loading categories',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /admin/users - Users management
router.get('/users', requireAdminWeb, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments({ isActive: true });

        res.render('admin/users', {
            user: req.user,
            users,
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit)
        });
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).render('error', { 
            message: 'Error loading users',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /admin/comments - Comments management
router.get('/comments', requireAuthWeb, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find()
            .populate('user', 'name email')
            .populate('article', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments();

        res.render('admin/comments', {
            user: req.user,
            comments,
            totalComments,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit)
        });
    } catch (error) {
        console.error('Comments error:', error);
        res.status(500).render('error', { 
            message: 'Error loading comments',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /admin/stats - Get admin statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const [
            articleStats,
            userStats,
            commentStats,
            categoryStats
        ] = await Promise.all([
            Article.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            User.getStats(),
            Comment.getStats(),
            Category.getWithArticleCount()
        ]);

        res.json({
            success: true,
            data: {
                articles: articleStats,
                users: userStats,
                comments: commentStats,
                categories: categoryStats
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// POST /admin/clear-cache - Clear cache
router.post('/clear-cache', authenticate, requireAdmin, (req, res) => {
    // In a real application, you would clear Redis cache or other cache mechanism
    res.json({
        success: true,
        message: 'Cache cleared successfully'
    });
});

module.exports = router;
