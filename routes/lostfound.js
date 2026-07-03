const express = require('express');
const { body, validationResult, query } = require('express-validator');
const LostFound = require('../models/LostFound');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { analyzeLostFoundPhoto } = require('../utils/photoAnalysis');

const router = express.Router();

router.post('/', authenticate, upload.array('photos', 3), [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('type').isIn(['lost', 'found']),
    body('location').optional().trim().isLength({ max: 200 }),
    body('contactInfo').optional().trim().isLength({ max: 100 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, description, type, location, contactInfo } = req.body;
        const photos = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadToCloudinary(file.buffer, 'lostfound');
                    photos.push(result);
                } catch (uploadError) {
                    console.error('Photo upload error:', uploadError);
                }
            }
        }

        let analysis = null;
        if (photos.length > 0 || description) {
            analysis = await analyzeLostFoundPhoto(
                photos[0]?.url,
                `${title} ${description}`
            );
        }

        const lostFoundItem = new LostFound({
            title,
            description,
            type,
            category: analysis?.suggestedCategory || 'Other',
            location,
            contactInfo,
            reporter: req.user._id,
            photos
        });

        await lostFoundItem.save();
        await lostFoundItem.populate('reporter', 'name apartmentNumber');

        res.status(201).json({
            message: 'Item posted successfully',
            item: lostFoundItem,
            analysis: analysis ? {
                suggestedCategory: analysis.suggestedCategory,
                confidence: analysis.confidence,
                tags: analysis.tags
            } : null
        });

    } catch (error) {
        console.error('Create lost/found error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authenticate, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['lost', 'found']),
    query('category').optional().isIn(['Electronics', 'Clothing', 'Keys', 'Documents', 'Jewelry', 'Books', 'Sports', 'Toys', 'Other']),
    query('status').optional().isIn(['active', 'resolved', 'expired'])
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

        const filter = { status: 'active' };
        if (req.query.type) filter.type = req.query.type;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.status) filter.status = req.query.status;

        const items = await LostFound.find(filter)
            .populate('reporter', 'name apartmentNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await LostFound.countDocuments(filter);

        res.json({
            items,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: items.length,
                totalItems: total
            }
        });

    } catch (error) {
        console.error('Get lost/found items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id)
            .populate('reporter', 'name apartmentNumber phoneNumber')
            .populate('claimedBy', 'name apartmentNumber');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.viewCount += 1;
        await item.save();

        res.json({ item });

    } catch (error) {
        console.error('Get lost/found item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/claim', authenticate, async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id)
            .populate('reporter', 'name email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.status !== 'active') {
            return res.status(400).json({ message: 'Item is no longer available' });
        }

        if (item.reporter._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot claim your own item' });
        }

        item.claimedBy = req.user._id;
        item.status = 'resolved';
        await item.save();

        res.json({
            message: 'Item claimed successfully',
            item
        });

    } catch (error) {
        console.error('Claim item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', authenticate, [
    body('status').optional().isIn(['active', 'resolved'])
], async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.reporter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        if (req.body.status) {
            item.status = req.body.status;
        }

        await item.save();

        res.json({
            message: 'Item updated successfully',
            item
        });

    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search/similar', authenticate, [
    query('description').notEmpty(),
    query('type').optional().isIn(['lost', 'found'])
], async (req, res) => {
    try {
        const { description, type } = req.query;

        const keywords = description.toLowerCase().split(' ').filter(word => word.length > 2);

        const searchRegex = new RegExp(keywords.join('|'), 'i');

        const filter = {
            status: 'active',
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        };

        if (type) {
            filter.type = type === 'lost' ? 'found' : 'lost';
        }

        const similarItems = await LostFound.find(filter)
            .populate('reporter', 'name apartmentNumber')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({ similarItems });

    } catch (error) {
        console.error('Search similar items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;