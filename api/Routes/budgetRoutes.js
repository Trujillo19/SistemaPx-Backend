const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const exercisedBudgetController = require('../Controllers/exercisedBudgetController');
const authController = require('../Controllers/authController');

// All the routes in Budget are protected.
router.use(authController.protect);
router.post('/exercised', upload.single('file'), exercisedBudgetController.createExercised);
router.get('/exercised', exercisedBudgetController.getExercised);
router.get('/exercised/:GM', exercisedBudgetController.getDetailView);


module.exports = router;

