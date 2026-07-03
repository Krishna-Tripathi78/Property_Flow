const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const complaintSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        enum: [
            'Plumbing',
            'Electrical',
            'Elevator',
            'Security',
            'Cleaning',
            'Parking',
            'Noise',
            'Common Area',
            'Water Supply',
            'Other'
        ]
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    resident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    photos: [{
        url: String,
        publicId: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    history: [complaintHistorySchema],
    isOverdue: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

complaintSchema.pre('save', function (next) {
    if (this.isNew) {
        this.history.push({
            status: this.status,
            changedBy: this.resident,
            note: 'Complaint created',
            timestamp: new Date()
        });

        const daysToAdd = this.priority === 'High' ? 3 : this.priority === 'Medium' ? 7 : 14;
        this.dueDate = new Date(Date.now() + (daysToAdd * 24 * 60 * 60 * 1000));
    }
    next();
});

complaintSchema.methods.updateStatus = function (newStatus, changedBy, note = '') {
    if (this.status !== newStatus) {
        this.status = newStatus;
        this.history.push({
            status: newStatus,
            changedBy: changedBy,
            note: note,
            timestamp: new Date()
        });

        if (newStatus === 'Resolved') {
            this.resolvedAt = new Date();
            this.isOverdue = false;
        }
    }
};

complaintSchema.methods.checkOverdue = function () {
    if (this.status !== 'Resolved' && this.dueDate < new Date()) {
        this.isOverdue = true;
    }
    return this.isOverdue;
};

complaintSchema.index({ resident: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: -1, createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ isOverdue: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);