const User = require('../models/User');
const Campground = require('../models/Campground');
// @desc Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = async (req, res, next) => {

    try {
        const { name, email, password, role, tel, address, picture } = req.body;
        //create user
        const user = await User.create({
            name,
            email,
            tel,
            address,
            password,
            picture, 
            role
        });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
}

exports.login = async (req, res, next) => {
    try{
    const { email, password } = req.body;
    //validate email & password
    if (!email || !password) {
        return res.status(401).json({ success: false, error: 'Please provide an email and password' });
    }

    //check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);

    } catch (err) {
        return res.status(401).json({ success: false ,msg: 'Cannot convert email or password to string'});
    }
};

const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() +  parseInt(process.env.JWT_COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
}

exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
};

// @desc Log user out / clear cookie
// @route GET /api/v1/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};


exports.updateProfile = async (req, res, next) => {
    try {
        const { name, tel, address, picture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, tel, address, picture },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
