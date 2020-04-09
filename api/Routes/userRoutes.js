const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

// Unprotected Routes. Everyone has access.
router.post('/login', authController.login);
router.post('/signup', authController.signup);

// Protected Routes. Only login User can access.
router.use(authController.protect);
router.get('/:id', userController.userDetail);




module.exports = router;
