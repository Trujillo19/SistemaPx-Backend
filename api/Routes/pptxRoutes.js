const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const pptxController = require('../Controllers/pptxController');

// Unprotected Routes. Everyone has access.

// Protected Routes. Only login User can access.
router.use(authController.protect);
router.get('/', pptxController.getPptx);

module.exports = router;
