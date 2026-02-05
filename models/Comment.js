const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, 'Article reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'spam'],
        default: 'approved'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    reportedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

// Virtual for report count
commentSchema.virtual('reportCount').get(function() {
    return this.reportedBy.length;
});

// Instance method to add like
commentSchema.methods.addLike = function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to remove like
commentSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    return this.save();
};

// Instance method to add reply
commentSchema.methods.addReply = function(commentId) {
    if (!this.replies.includes(commentId)) {
        this.replies.push(commentId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to report comment
commentSchema.methods.report = function(userId, reason) {
    const existingReport = this.reportedBy.find(
        report => report.user.toString() === userId.toString()
    );
    
    if (!existingReport) {
        this.reportedBy.push({ user: userId, reason });
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to check if user liked comment
commentSchema.methods.isLikedBy = function(userId) {
    return this.likes.includes(userId);
};

// Instance method to check if user reported comment
commentSchema.methods.isReportedBy = function(userId) {
    return this.reportedBy.some(
        report => report.user.toString() === userId.toString()
    );
};

// Instance method to edit comment
commentSchema.methods.editComment = function(newContent) {
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    return this.save();
};

// Static method to get approved comments for article
commentSchema.statics.getApprovedForArticle = function(articleId) {
    return this.find({ 
        article: articleId, 
        status: 'approved',
        parentComment: null 
    })
        .populate('user', 'name avatar')
        .populate({
            path: 'replies',
            match: { status: 'approved' },
            populate: { path: 'user', select: 'name avatar' }
        })
        .sort({ createdAt: -1 });
};

// Static method to get pending comments
commentSchema.statics.getPending = function() {
    return this.find({ status: 'pending' })
        .populate('user', 'name email')
        .populate('article', 'title')
        .sort({ createdAt: -1 });
};

// Static method to get comment statistics
commentSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        spam: 0
    };
    
    stats.forEach(stat => {
        result.total += stat.count;
        result[stat._id] = stat.count;
    });
    
    return result;
};

// Index for article lookup
commentSchema.index({ article: 1, status: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
