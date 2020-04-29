const express = require('express');
const router = express.Router();
var multer  = require('multer');

// const exercisedBudgetController = require('../Controllers/exercisedBudgetController');
// const authorizedBudgerController = require('../Controllers/authorizedBudgerController');
const authController = require('../Controllers/authController');
const budgetController = require('../Controllers/budgetController');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'downloads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage });

// All the routes in Budget are protected.
router.use(authController.protect);

// Simplified routes
router.post('/authorized', upload.single('autorizado'), budgetController.postAuthorized);
router.post('/exercised', upload.single('ejercicio'), budgetController.postExercised);
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

