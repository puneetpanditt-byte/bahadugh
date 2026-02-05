const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const { authenticateWeb, optionalAuth } = require('../middleware/auth');

// GET /articles - Articles listing page (redirect to home)
router.get('/', (req, res) => {
    res.redirect('/');
});

// GET /articles/search - Search articles page
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.redirect('/');
        }

        const filters = { status: 'published' };
        if (req.query.category) {
            filters.category = req.query.category;
        }

        const articles = await Article.search(query, filters)
            .populate('author', 'name')
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({
            status: 'published',
            $text: { $search: query },
            ...filters
        });

        const Category = require('../models/Category');
        const categories = await Category.getActive();

        res.render('pages/search', {
            user: req.user,
            articles,
            query,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalResults: total
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('error', { 
            message: 'Error searching articles',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /articles/tag/:tag - Articles by tag
router.get('/tag/:tag', async (req, res) => {
    try {
        const tag = req.params.tag;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const articles = await Article.find({
            status: 'published',
            tags: tag
        })
            .populate('author', 'name')
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({
            status: 'published',
            tags: tag
        });

        const Category = require('../models/Category');
        const categories = await Category.getActive();

        res.render('pages/tag', {
            user: req.user,
            articles,
            tag,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Tag error:', error);
        res.status(500).render('error', { 
            message: 'Error loading articles by tag',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /articles/featured - Featured articles
router.get('/featured', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const articles = await Article.getFeatured(limit)
            .populate('author', 'name')
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({
            featured: true,
            status: 'published'
        });

        const Category = require('../models/Category');
        const categories = await Category.getActive();

        res.render('pages/featured', {
            user: req.user,
            articles,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Featured articles error:', error);
        res.status(500).render('error', { 
            message: 'Error loading featured articles',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /articles/trending - Trending articles
router.get('/trending', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const articles = await Article.getTrending(days, limit)
            .populate('author', 'name')
            .skip(skip)
            .limit(limit);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const total = await Article.countDocuments({
            status: 'published',
            publishDate: { $gte: startDate }
        });

        const Category = require('../models/Category');
        const categories = await Category.getActive();

        res.render('pages/trending', {
            user: req.user,
            articles,
            categories,
            days,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Trending articles error:', error);
        res.status(500).render('error', { 
            message: 'Error loading trending articles',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /articles/latest - Latest articles
router.get('/latest', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const articles = await Article.find({ status: 'published' })
            .populate('author', 'name')
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({ status: 'published' });

        const Category = require('../models/Category');
        const categories = await Category.getActive();

        res.render('pages/latest', {
            user: req.user,
            articles,
            categories,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Latest articles error:', error);
        res.status(500).render('error', { 
            message: 'Error loading latest articles',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// GET /articles/rss - RSS feed
router.get('/rss', async (req, res) => {
    try {
        const articles = await Article.find({ status: 'published' })
            .sort({ publishDate: -1 })
            .limit(20)
            .populate('author', 'name');

        const rss = generateRSS(articles);
        
        res.set('Content-Type', 'application/rss+xml');
        res.send(rss);
    } catch (error) {
        console.error('RSS error:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

// Generate RSS XML
function generateRSS(articles) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Bahadurgarh News</title>
<description>Latest news from Bahadurgarh and around the world</description>
<link>${baseUrl}</link>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    articles.forEach(article => {
        xml += `
<item>
<title>${article.title}</title>
<description>${article.shortDescription}</description>
<link>${baseUrl}/article/${article._id}</link>
<guid>${baseUrl}/article/${article._id}</guid>
<pubDate>${article.publishDate.toUTCString()}</pubDate>
<author>${article.author}</author>
</item>`;
    });

    xml += `
</channel>
</rss>`;
    
    return xml;
}

module.exports = router;
