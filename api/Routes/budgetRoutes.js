const express = require('express');
const router = express.Router();
var multer  = require('multer');
const authController = require('../Controllers/authController');
const budgetController = require('../Controllers/budgetController');

// Multer settings.
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
router.get('/chart', budgetController.getChart);
router.post('/authorized', upload.single('autorizado'), budgetController.postAuthorized);
router.post('/authorizedSimple', upload.single('autorizado'), budgetController.postAuthorizedSimple);
router.post('/exercised', upload.single('ejercicio'), budgetController.postExercised);
router.get('/exercised', budgetController.getExercised);
router.delete('/exercised/:id', budgetController.deleteExercised);
router.post('/copades', upload.single('copades'), budgetController.postCopades);
router.get('/copades', budgetController.getCopades);
router.delete('/copades/:id', budgetController.deleteCopades);
router.post('/received', upload.single('recepcion'), budgetController.postReceived);
router.get('/received', budgetController.getReceived);
router.delete('/received/:id', budgetController.deleteReceived);
router.post('/exercisechart', budgetController.postExerciseChart);
router.get('/exercisechart', budgetController.getExerciseChart);
router.delete('/exercisechart/:id', budgetController.deleteExerciseChart);


module.exports = router;

