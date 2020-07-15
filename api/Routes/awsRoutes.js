const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const awsController = require('../Controllers/awsController');

// Unprotected Routes. Everyone has access.

// Protected Routes. Only login User can access.
router.use(authController.protect);
router.get('/', awsController.uploadProfilePicture);

module.exports = router;
