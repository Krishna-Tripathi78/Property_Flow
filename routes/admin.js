const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();

// Update complaint status and priority (Admin only)
router.put('/complaints/:id', authenticate, requireAdmin, [
    body('status').optional().isIn(['Open', 'In Progress', 'Resolved']).withMessage('Invalid status'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { status, priority, note, assignedTo } = req.body;

        const complaint = await Complaint.findById(req.params.id)
            .populate('resident', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if complaint is already resolved
        if (complaint.status === 'Resolved' && status && status !== 'Resolved') {
            return res.status(400).json({ message: 'Cannot change status of a resolved complaint' });
        }

        let emailSent = false;

        // Update status if provided
        if (status && status !== complaint.status) {
            complaint.updateStatus(status, req.user._id, note || '');

            // Send email notification for status change
            try {
                await emailService.sendComplaintStatusUpdate(
                    complaint.resident.email,
                    complaint.resident.name,
                    complaint.title,
                    status,
                    note
                );
                emailSent = true;
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        // Update priority if provided
        if (priority && priority !== complaint.priority) {
            complaint.priority = priority;

            // Recalculate due date based on new priority
            if (complaint.status !== 'Resolved') {
                const daysToAdd = priority === 'High' ? 3 : priority === 'Medium' ? 7 : 14;
                complaint.dueDate = new Date(Date.now() + (daysToAdd * 24 * 60 * 60 * 1000));
            }
        }

        // Update assigned user if provided
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }
            complaint.assignedTo = assignedTo;
        }

        await complaint.save();

        // Populate for response
        await complaint.populate([
            { path: 'resident', select: 'name email apartmentNumber' },
            { path: 'assignedTo', select: 'name email' },
            { path: 'history.changedBy', select: 'name role' }
        ]);

        res.json({
            message: `Complaint updated successfully${emailSent ? ' and notification sent' : ''}`,
            complaint
        });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Server error while updating complaint' });
    }
});

// Get dashboard statistics (Admin only)
router.get('/dashboard/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        // Update overdue status first
        await Complaint.updateMany(
            {
                status: { $ne: 'Resolved' },
                dueDate: { $lt: new Date() }
            },
            { isOverdue: true }
        );

        // Get complaint statistics
        const [
            totalComplaints,
            statusStats,
            categoryStats,
            priorityStats,
            overdueCount,
            recentComplaints,
            monthlyStats
        ] = await Promise.all([
            // Total complaints
            Complaint.countDocuments(),

            // Complaints by status
            Complaint.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Complaints by category
            Complaint.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),

            // Complaints by priority
            Complaint.aggregate([
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),

            // Overdue complaints count
            Complaint.countDocuments({ isOverdue: true }),

            // Recent complaints (last 7 days)
            Complaint.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),

            // Monthly statistics (last 6 months)
            Complaint.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        // Format the statistics
        const stats = {
            overview: {
                total: totalComplaints,
                recent: recentComplaints,
                overdue: overdueCount,
                resolved: statusStats.find(s => s._id === 'Resolved')?.count || 0
            },
            byStatus: statusStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, { Open: 0, 'In Progress': 0, Resolved: 0 }),
            byCategory: categoryStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            byPriority: priorityStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, { Low: 0, Medium: 0, High: 0 }),
            monthly: monthlyStats.map(stat => ({
                month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
                count: stat.count
            }))
        };

        res.json({ stats });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats' });
    }
});

// Get all users (Admin only)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

// Toggle user active status (Admin only)
router.put('/users/:id/status', authenticate, requireAdmin, [
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error while updating user status' });
    }
});

module.exports = router;