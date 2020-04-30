const express = require('express');
const router = express.Router();
var multer  = require('multer');
const authController = require('../Controllers/authController');
const budgetController = require('../Controllers/budgetController');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.xlsx');
    }
});
var upload = multer({ storage: storage });

// All the routes in Budget are protected.
router.use(authController.protect);

// Simplified routes
router.get('/', budgetController.getBudget);
router.post('/authorized', upload.single('autorizado'), budgetController.postAuthorized);
router.post('/exercised', upload.single('ejercicio'), budgetController.postExercised);
router.post('/received', upload.single('received'), budgetController.postReceived);

module.exports = router;

