const express = require('express');
const 
{ register, login, getMe , logout, updateProfile, userRecord} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/record', userRecord);


module.exports = router;