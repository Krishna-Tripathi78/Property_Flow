const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();

// Create a new notice (Admin only)
router.post('/', authenticate, requireAdmin, [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('category').optional().isIn(['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'])
        .withMessage('Please select a valid category'),
    body('isImportant').optional().isBoolean().withMessage('isImportant must be a boolean'),
    body('expiresAt').optional().isISO8601().withMessage('Please provide a valid expiration date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, content, category, isImportant, expiresAt } = req.body;

        const notice = new Notice({
            title,
            content,
            author: req.user._id,
            category: category || 'General',
            isImportant: isImportant || false,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        await notice.save();

        // Populate author info for response
        await notice.populate('author', 'name email');

        // Send email notifications for important notices
        if (isImportant) {
            try {
                // Get all active residents
                const residents = await User.find({
                    role: 'resident',
                    isActive: true
                }).select('name email');

                // Send notifications in background (don't wait)
                const emailPromises = residents.map(resident =>
                    emailService.sendImportantNoticeAlert(
                        resident.email,
                        resident.name,
                        title,
                        content
                    ).catch(error => console.error('Failed to send notice email to', resident.email, error))
                );

                // Start sending emails but don't wait
                Promise.all(emailPromises);
            } catch (emailError) {
                console.error('Failed to send notice notifications:', emailError);
            }
        }

        res.status(201).json({
            message: 'Notice created successfully',
            notice
        });
    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({ message: 'Server error while creating notice' });
    }
});

// Get all notices (visible to all authenticated users)
router.get('/', authenticate, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isIn(['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'])
        .withMessage('Invalid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gte: new Date() } }
            ]
        };

        if (req.query.category) {
            query.category = req.query.category;
        }

        // Get notices with pinned ones first
        const notices = await Notice.find(query)
            .populate('author', 'name')
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Notice.countDocuments(query);

        res.json({
            notices,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalNotices: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ message: 'Server error while fetching notices' });
    }
});

// Get a specific notice by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id)
            .populate('author', 'name email');

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // Check if notice is active and not expired
        if (!notice.isActive || (notice.expiresAt && notice.expiresAt < new Date())) {
            return res.status(404).json({ message: 'Notice not found or expired' });
        }

        // Increment view count
        notice.viewCount += 1;
        await notice.save();

        res.json({ notice });
    } catch (error) {
        console.error('Get notice error:', error);
        res.status(500).json({ message: 'Server error while fetching notice' });
    }
});

// Update a notice (Admin only)
router.put('/:id', authenticate, requireAdmin, [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('category').optional().isIn(['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'])
        .withMessage('Please select a valid category'),
    body('isImportant').optional().isBoolean().withMessage('isImportant must be a boolean'),
    body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
    body('expiresAt').optional().isISO8601().withMessage('Please provide a valid expiration date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const updateData = { ...req.body };

        // Convert date string to Date object if provided
        if (updateData.expiresAt) {
            updateData.expiresAt = new Date(updateData.expiresAt);
        }

        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.json({
            message: 'Notice updated successfully',
            notice
        });
    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({ message: 'Server error while updating notice' });
    }
});

// Delete/deactivate a notice (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.json({
            message: 'Notice deleted successfully'
        });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({ message: 'Server error while deleting notice' });
    }
});

module.exports = router;