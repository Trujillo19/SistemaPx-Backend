const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const exercisedBudgetController = require('../Controllers/exercisedBudgetController');
const authorizedBudgerController = require('../Controllers/authorizedBudgerController');
const authController = require('../Controllers/authController');

// All the routes in Budget are protected.
router.use(authController.protect);

// Exercised Routes
router.post('/exercised', upload.single('file'), exercisedBudgetController.createExercised);
router.get('/exercised', exercisedBudgetController.getExercised);
router.get('/exercised/:GM', exercisedBudgetController.getDetailView);

// Authorized Routes
router.post('/authorized', upload.single('file'), authorizedBudgerController.createAuthorized);
router.get('/authorized', authorizedBudgerController.getAuthorized);

module.exports = router;

