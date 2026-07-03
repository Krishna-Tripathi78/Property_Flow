const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Keys', 'Documents', 'Jewelry', 'Books', 'Sports', 'Toys', 'Other'],
        default: 'Other'
    },
    photos: [{
        url: String,
        publicId: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        type: String,
        trim: true,
        maxlength: 200
    },
    contactInfo: {
        type: String,
        trim: true,
        maxlength: 100
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'expired'],
        default: 'active'
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

lostFoundSchema.index({ type: 1, status: 1, createdAt: -1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ reporter: 1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);