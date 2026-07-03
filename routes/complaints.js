const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, requireResident } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const emailService = require('../utils/emailService');

const router = express.Router();

// Create a new complaint
router.post('/', authenticate, requireResident, upload.array('photos', 5), [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category').isIn(['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Common Area', 'Water Supply', 'Other'])
        .withMessage('Please select a valid category')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, description, category } = req.body;
        const photos = [];

        // Upload photos to Cloudinary
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(file.buffer, 'complaints');
                    photos.push(result);
                } catch (uploadError) {
                    console.error('Photo upload error:', uploadError);
                    // Continue without this photo rather than failing the whole complaint
                }
            }
        }

        const complaint = new Complaint({
            title,
            description,
            category,
            resident: req.user._id,
            photos
        });

        await complaint.save();

        // Populate resident info for response
        await complaint.populate('resident', 'name email apartmentNumber');

        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ message: 'Server error while creating complaint' });
    }
});

// Get complaints for the authenticated user (residents see their own, admins see all)
router.get('/', authenticate, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['Open', 'In Progress', 'Resolved']).withMessage('Invalid status'),
    query('category').optional().isIn(['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Common Area', 'Water Supply', 'Other'])
        .withMessage('Invalid category'),
    query('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
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

        // Build query based on user role and filters
        let query = {};

        if (req.user.role === 'resident') {
            query.resident = req.user._id;
        }

        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        if (req.query.priority) {
            query.priority = req.query.priority;
        }

        if (req.query.dateFrom || req.query.dateTo) {
            query.createdAt = {};
            if (req.query.dateFrom) {
                query.createdAt.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                query.createdAt.$lte = new Date(req.query.dateTo);
            }
        }

        // Check for overdue complaints (admin only)
        if (req.user.role === 'admin') {
            // Update overdue status for all open complaints
            await Complaint.updateMany(
                {
                    status: { $ne: 'Resolved' },
                    dueDate: { $lt: new Date() }
                },
                { isOverdue: true }
            );

            // Sort overdue complaints to the top for admins
            const sort = req.query.sortBy === 'newest' ? { createdAt: -1 } :
                { isOverdue: -1, priority: -1, createdAt: -1 };

            const complaints = await Complaint.find(query)
                .populate('resident', 'name email apartmentNumber')
                .populate('assignedTo', 'name email')
                .sort(sort)
                .limit(limit)
                .skip(skip);

            const total = await Complaint.countDocuments(query);

            return res.json({
                complaints,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalComplaints: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });
        } else {
            // For residents, simple sort by newest first
            const complaints = await Complaint.find(query)
                .populate('resident', 'name email apartmentNumber')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await Complaint.countDocuments(query);

            return res.json({
                complaints,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalComplaints: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });
        }
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Server error while fetching complaints' });
    }
});

// Get a specific complaint by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('resident', 'name email apartmentNumber')
            .populate('assignedTo', 'name email')
            .populate('history.changedBy', 'name role');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has permission to view this complaint
        if (req.user.role === 'resident' && complaint.resident._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. You can only view your own complaints.' });
        }

        res.json({ complaint });
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({ message: 'Server error while fetching complaint' });
    }
});

module.exports = router;