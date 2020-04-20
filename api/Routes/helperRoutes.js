const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const sortFileController = require('../Controllers/sortFileController');
const authController = require('../Controllers/authController');

// All the routes in Budget are protected.
router.use(authController.protect);

// Exercised Routes
router.post('/sorter', upload.single('file'), sortFileController.sort);


module.exports = router;

