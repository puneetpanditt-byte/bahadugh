const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'editor', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    savedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        notifications: {
            comments: {
                type: Boolean,
                default: true
            },
            replies: {
                type: Boolean,
                default: true
            },
            newsletter: {
                type: Boolean,
                default: true
            }
        }
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    }
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            return ret;
        }
    },
    toObject: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            return ret;
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update last login on successful authentication
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        bio: this.bio,
        socialLinks: this.socialLinks,
        createdAt: this.createdAt
    };
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Instance method to check if user is editor or admin
userSchema.methods.isEditor = function() {
    return ['editor', 'admin'].includes(this.role);
};

// Instance method to check if user can edit article
userSchema.methods.canEditArticle = function(article) {
    if (this.role === 'admin') return true;
    if (this.role === 'editor') return true;
    return false;
};

// Instance method to check if user can delete article
userSchema.methods.canDeleteArticle = function(article) {
    return this.role === 'admin';
};

// Instance method to save article
userSchema.methods.saveArticle = function(articleId) {
    if (!this.savedArticles.includes(articleId)) {
        this.savedArticles.push(articleId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to unsave article
userSchema.methods.unsaveArticle = function(articleId) {
    this.savedArticles = this.savedArticles.filter(id => id.toString() !== articleId.toString());
    return this.save();
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
    return this.findOne({ email }).select('+password');
};

// Static method to create admin user
userSchema.statics.createAdmin = function(userData) {
    return this.create({
        ...userData,
        role: 'admin',
        emailVerified: true
    });
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        total: 0,
        users: 0,
        editors: 0,
        admins: 0
    };
    
    stats.forEach(stat => {
        result.total += stat.count;
        if (stat._id === 'user') result.users = stat.count;
        else if (stat._id === 'editor') result.editors = stat.count;
        else if (stat._id === 'admin') result.admins = stat.count;
    });
    
    return result;
};

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
    return `/profile/${this._id}`;
});

// Index for email lookup
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
