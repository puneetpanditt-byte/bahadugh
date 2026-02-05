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
    requireEditor
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

// Apply authentication to all admin API routes
router.use(authenticate);

// Categories API
router.get('/categories', requireAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, name: 1 });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

router.post('/categories', requireAdmin, async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        };
        
        const category = new Category(categoryData);
        await category.save();
        
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category'
        });
    }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        };
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            categoryData,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category'
        });
    }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category'
        });
    }
});

// Users API
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({ isActive: true })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const userData = {
            ...req.body,
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        };
        
        // Remove password field if present (should be handled separately)
        delete userData.password;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            userData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});

// Comments API
router.get('/comments', requireAdmin, async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('user', 'name email')
            .populate('article', 'title')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments'
        });
    }
});

router.put('/comments/:id', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email').populate('article', 'title');
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        
        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update comment'
        });
    }
});

router.delete('/comments/:id', requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete comment'
        });
    }
});

// Articles API for admin
router.get('/articles', requireEditor, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.category) {
            filters.category = req.query.category;
        }
        
        const articles = await Article.find(filters)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Article.countDocuments(filters);
        
        res.json({
            success: true,
            data: {
                articles,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles'
        });
    }
});

router.post('/articles', requireEditor, upload.single('image'), async (req, res) => {
    try {
        const articleData = {
            ...req.body,
            author: req.user._id
        };
        
        if (req.file) {
            articleData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const article = new Article(articleData);
        await article.save();
        
        await article.populate('author', 'name email');
        
        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create article'
        });
    }
});

router.put('/articles/:id', requireEditor, upload.single('image'), async (req, res) => {
    try {
        const articleData = { ...req.body };
        
        if (req.file) {
            articleData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            articleData,
            { new: true, runValidators: true }
        ).populate('author', 'name email');
        
        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Article not found'
            });
        }
        
        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update article'
        });
    }
});

router.delete('/articles/:id', requireAdmin, async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        
        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Article not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete article'
        });
    }
});

// Dashboard stats API
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [
            totalArticles,
            publishedArticles,
            totalUsers,
            activeUsers,
            totalComments,
            approvedComments
        ] = await Promise.all([
            Article.countDocuments(),
            Article.countDocuments({ status: 'published' }),
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Comment.countDocuments(),
            Comment.countDocuments({ status: 'approved' })
        ]);
        
        const totalViews = await Article.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        
        res.json({
            success: true,
            data: {
                articles: {
                    total: totalArticles,
                    published: publishedArticles,
                    drafts: totalArticles - publishedArticles
                },
                users: {
                    total: totalUsers,
                    active: activeUsers
                },
                comments: {
                    total: totalComments,
                    approved: approvedComments,
                    pending: totalComments - approvedComments
                },
                views: totalViews[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats'
        });
    }
});

module.exports = router;
