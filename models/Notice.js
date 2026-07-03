const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'],
        default: 'General'
    },
    expiresAt: {
        type: Date
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

noticeSchema.pre('save', function (next) {
    if (this.isImportant) {
        this.isPinned = true;
    }
    next();
});

noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ isActive: 1, createdAt: -1 });
noticeSchema.index({ category: 1 });

module.exports = mongoose.model('Notice', noticeSchema);