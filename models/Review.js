const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    campground: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

ReviewSchema.pre('save', function(next) {
    console.log('Review being saved');
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);