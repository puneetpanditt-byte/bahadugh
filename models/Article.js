const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Article content is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['india', 'world', 'business', 'sports', 'entertainment', 'technology', 'health'],
        lowercase: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    imageUrl: {
        type: String,
        default: ''
    },
    imageCaption: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    breakingNews: {
        type: Boolean,
        default: false
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    readingTime: {
        type: Number,
        min: 1
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from title
articleSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    next();
});

// Calculate reading time if not provided
articleSchema.pre('save', function(next) {
    if (this.isModified('content') && !this.readingTime) {
        const wordsPerMinute = 200;
        const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        this.readingTime = Math.ceil(wordCount / wordsPerMinute);
    }
    next();
});

// Virtual for formatted publish date
articleSchema.virtual('formattedPublishDate').get(function() {
    return this.publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for URL
articleSchema.virtual('url').get(function() {
    return `/article/${this._id}`;
});

// Index for search functionality
articleSchema.index({
    title: 'text',
    content: 'text',
    shortDescription: 'text',
    tags: 'text'
});

// Index for filtering
articleSchema.index({ category: 1, status: 1, publishDate: -1 });
articleSchema.index({ featured: 1, status: 1 });
articleSchema.index({ breakingNews: 1, status: 1 });

// Static method to get featured articles
articleSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ featured: true, status: 'published' })
        .sort({ publishDate: -1 })
        .limit(limit);
};

// Static method to get breaking news
articleSchema.statics.getBreakingNews = function(limit = 10) {
    return this.find({ breakingNews: true, status: 'published' })
        .sort({ publishDate: -1 })
        .limit(limit);
};

// Static method to get trending articles
articleSchema.statics.getTrending = function(days = 7, limit = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.find({
        status: 'published',
        publishDate: { $gte: startDate }
    })
        .sort({ views: -1 })
        .limit(limit);
};

// Static method to search articles
articleSchema.statics.search = function(query, filters = {}) {
    const searchQuery = {
        status: 'published',
        ...filters,
        $text: { $search: query }
    };
    
    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, publishDate: -1 });
};

// Instance method to increment views
articleSchema.methods.incrementViews = function() {
    return this.updateOne({ $inc: { views: 1 } });
};

// Instance method to check if user can edit
articleSchema.methods.canEdit = function(user) {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'editor';
};

// Instance method to check if user can delete
articleSchema.methods.canDelete = function(user) {
    if (!user) return false;
    return user.role === 'admin';
};

module.exports = mongoose.model('Article', articleSchema);
