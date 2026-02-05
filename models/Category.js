const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    color: {
        type: String,
        default: '#3B82F6',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
    },
    icon: {
        type: String,
        default: 'fas fa-newspaper'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    articleCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name
categorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for URL
categorySchema.virtual('url').get(function() {
    return `/category/${this.slug}`;
});

// Virtual for article count (real-time)
categorySchema.virtual('realArticleCount', {
    ref: 'Article',
    localField: 'slug',
    foreignField: 'category',
    count: true,
    match: { status: 'published' }
});

// Static method to get active categories
categorySchema.statics.getActive = function() {
    return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to get category with article count
categorySchema.statics.getWithArticleCount = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: 'articles',
                localField: 'slug',
                foreignField: 'category',
                as: 'articles'
            }
        },
        {
            $addFields: {
                articleCount: {
                    $size: {
                        $filter: {
                            input: '$articles',
                            cond: { $eq: ['$$this.status', 'published'] }
                        }
                    }
                }
            }
        },
        { $project: { articles: 0 } },
        { $sort: { order: 1, name: 1 } }
    ]);
};

// Static method to update article counts
categorySchema.statics.updateArticleCounts = async function() {
    const categories = await this.find();
    
    for (const category of categories) {
        const Article = mongoose.model('Article');
        const count = await Article.countDocuments({ 
            category: category.slug, 
            status: 'published' 
        });
        
        if (category.articleCount !== count) {
            category.articleCount = count;
            await category.save();
        }
    }
};

// Instance method to increment article count
categorySchema.methods.incrementArticleCount = function() {
    this.articleCount += 1;
    return this.save();
};

// Instance method to decrement article count
categorySchema.methods.decrementArticleCount = function() {
    if (this.articleCount > 0) {
        this.articleCount -= 1;
        return this.save();
    }
    return Promise.resolve(this);
};

// Index for name lookup
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
