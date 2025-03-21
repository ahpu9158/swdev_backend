const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    campground: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: [true, 'Please choose a campgound.']
    }, 
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    discount: {
        type: Number,
        required: [true, 'Please add a discount']
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Promotion', PromotionSchema);