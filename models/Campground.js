const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name'],
        unique : true,
        trim : true,
        maxlength : [50, 'Name cannot be more than 50 characters']
    },
    slug : String,
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    tel: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    capacity: {
        type: Number,
        required: [true, 'Please add a capacity']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// Reverse populate with virtuals : booking
CampgroundSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'campground',
    justOne: false
});

// Reverse populate with virtuals : review
CampgroundSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'campground',
    justOne: false
});
// Reverse populate with virtuals : promotion
CampgroundSchema.virtual('promotions', {
    ref: 'Promotion',
    localField: '_id',
    foreignField: 'campground',
    justOne: false
});


CampgroundSchema.pre('save', async function(next) {

    try {
        const slugify = require('slugify');
        next();
    } catch (err) {
        next(err);
    }

    if (!this.isModified('name')) {
        next();
    }

    let originalSlug = slugify(this.name, { lower: true });
    let uniqueSlug = originalSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${originalSlug}-${counter}`;
        counter++;
    }

    this.slug = uniqueSlug;
    next();
});

CampgroundSchema.pre('deleteOne', {document:true, query:false},async function(next) {
    console.log(`Bookings being removed from campground ${this._id}`);
    await this.model('Booking').deleteMany({ campground: this._id });

    console.log(`Reviews being removed from campground ${this._id}`);
    await this.model('Review').deleteMany({ campground: this._id });

    console.log(`Promotions being removed from campground ${this._id}`);
    await this.model('Promotion').deleteMany({ campground: this._id });
    next();
});

module.exports = mongoose.model('Campground', CampgroundSchema);