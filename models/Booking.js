const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user.']
    },
    campground: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: [true, 'Please choose a campgound.']
    }, 
    checkInDate: {
        type: Date,
        required: [true, 'Please choose a check in date.']
    },
    checkOutDate: {
        type: Date,
        required:  [true, 'Please choose a check out date.']
    },
    promotion: {
        type: mongoose.Schema.ObjectId,
        ref: 'Promotion',
    },
    bookingAt: { 
        type: Date, 
        default: Date.now 
    }

});

module.exports = mongoose.model('Booking',BookingSchema);