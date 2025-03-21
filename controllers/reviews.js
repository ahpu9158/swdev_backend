const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Promotion = require('../models/Promotion');
const Campground = require('../models/Campground');


// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Fields to exclude

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    // Create query string

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = Review.find(JSON.parse(queryStr))


    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-rating');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Promotion.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Executing query
        const reviews = await query.populate({
            path: 'campground',
            select: 'name address tel'
        });

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({ success: true, count : reviews.length, data: reviews });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
};

// @desc    Create new review
// @route   POST /api/v1/hospitals/:hospitalId/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    req.body.hospital = req.params.hospitalId;
    req.body.user = req.user.id;

    try {
        const review = await Review.create(req.body);
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
    try {
        const review
            = await Review.findByIdAndUpdate(req
                .params.id, req.body, {
                new: true,
                runValidators: true
            }); if (!review) {
                return res.status(400).json({ success: false });
            } res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
}

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        res.status(400).json({ success: false });
    }
};