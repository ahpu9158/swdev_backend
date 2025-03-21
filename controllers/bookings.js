const Booking = require('../models/Booking');
const Campground = require('../models/Campground');

//@desc Get all bookings
//@route GET /api/v1/bookings
//@access Public
exports.getBookings = async (req, res, next) => {
    let query;
    //General users can see only their bookings
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path: 'campground',
            select: 'name address tel'
        });

    } else {
        if (req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Booking.find({ campground: req.params.campgroundId }).populate({
                path: 'campground',
                select: 'name address tel'
            });
        } else {
            query = Booking.find().populate({
                path: 'campground',
                select: 'name address tel'
            });
        }
    }

    try {
        const bookings = await query;

        res.status(200).json({ success: true, count : bookings.length, data: bookings });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot find Booking" });
    }
};

//@desc Get single booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async (req, res, next) => {
    
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'campground',
            select: 'name address tel'
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: "Cannot find Booking" });
    }
};

//@desc Create new booking
//@route POST /api/v1/campground/:campgroundsId/bookings/
//@access Private
exports.addBooking = async (req, res, next) => {
    
    try {
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if (!campground) {
            return res.status(404).json({ success: false, message: `No campground with the id of ${req.params.campgroundId}` });
        }

        //add user to req.body
        req.body.user = req.user.id;

        // check day more than 3 day
        const { checkInDate, checkOutDate } = req.body;
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        const timeDiff = endDate - startDate;
        const dayDiff = timeDiff / (1000 * 60 * 60 * 24); // change to day

        if (dayDiff > 3) {
            return res.status(400).json({ success: false, message: "Booking period cannot exceed 3 days" });
        }

    
        const booking = await Booking.create(req.body);

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: "Cannot create Booking" });
    }
};

//@desc Update booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
    
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        //Make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.params.id} is not authorized to update this booking` });
        }


        // Checkday check-in and check-out update
        const { checkInDate, checkOutDate } = req.body;

        if (checkInDate && checkOutDate) { // check have data
            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            const timeDiff = endDate - startDate;
            const dayDiff = timeDiff / (1000 * 60 * 60 * 24); // change day

            if (dayDiff > 3) {
                return res.status(400).json({ success: false, message: "Booking period cannot exceed 3 days" });
            }

            if (startDate > endDate) {
                return res.status(400).json({ success: false, message: "Check-out date cannot be before check-in date" });
            }
        }
        
        booking = await Booking.findByIdAndUpdate(req.params.id , req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: "Cannot update Booking" });
    }
};

//@desc Delete booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking = async (req, res, next) => {
    
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        //Make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.params.id} is not authorized to delete this booking` });
        }

        await booking.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: "Cannot delete booking" });
    }
};