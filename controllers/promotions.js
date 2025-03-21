const Promotion = require('../models/Promotion');
const Campground = require('../models/Campground'); 

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Public
exports.getPromotions = async (req, res, next) => {
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
    
    console.log("Debug Here");
    query = Promotion.find(JSON.parse(queryStr));


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
        query = query.sort('-discount');
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
        const promotions = await query.populate({
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

        res.status(200).json({ success: true, count : promotions.length, data: promotions });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single promotion
// @route   GET /api/v1/promotions/:id
// @access  Public
exports.getPromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id).populate({
            path: 'campground',
            select: 'name address tel'
        });

        if (!promotion) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: promotion });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new promotion
// @route   POST /api/v1/promotions
// @access  Private
exports.createPromotion = async (req, res, next) => {
    const promotion = await Promotion.create(req.body);
    res.status(201).json({
        success: true,
        data: promotion
    });
};

// @desc    Update promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private
exports.updatePromotion = async (req, res) => {
    try {
            const promotion = await Promotion.findByIdAndUpdate(req.params.id , req.body, {
                new: true,
                runValidators: true
            });
    
            if (!promotion) {
                return res.status(400).json({ success: false });
            }
    
            res.status(200).json({ success: true, data: promotion });
        } catch (err) {
            res.status(400).json({ success: false });
        }
};

// @desc    Delete promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private
exports.deletePromotion = async (req, res, next) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);

        if (!promotion) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

