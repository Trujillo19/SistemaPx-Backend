const express = require('express');
const router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'downloads/' });
// const exercisedBudgetController = require('../Controllers/exercisedBudgetController');
// const authorizedBudgerController = require('../Controllers/authorizedBudgerController');
const authController = require('../Controllers/authController');
const budgetController = require('../Controllers/budgetController');

// All the routes in Budget are protected.
router.use(authController.protect);

// Simplified routes
router.post('/authorized', upload.single('file'), budgetController.postAuthorized);
router.post('/exercised', upload.single('file'), budgetController.postExercised);
router.get('/', budgetController.getAll);


// For developent and debug.
router.get('/job/:id', budgetController.getJobs);

// // Exercised Routes
// router.post('/exercised', upload.single('file'), exercisedBudgetController.createExercised);
// router.get('/exercised', exercisedBudgetController.getExercised);
// router.get('/exercised/:GM', exercisedBudgetController.getDetailView);

// // Authorized Routes
// router.post('/authorized', upload.single('file'), authorizedBudgerController.createAuthorized);
// router.get('/authorized', authorizedBudgerController.getAuthorized);

module.exports = router;

