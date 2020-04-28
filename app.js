const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const Queue = require('bull');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const workQueue = new Queue('work', REDIS_URL);

// Route declaration
const userRoutes = require('./api/Routes/userRoutes');
const budgetRoutes = require('./api/Routes/budgetRoutes');
const helperRoutes = require('./api/Routes/helperRoutes');

// Error handler
const globalErrHandler = require('./api/Controllers/errorController');
const AppError = require('./api/Helpers/appError');

const app = express();

// Allow Cross-Origin request
app.use(cors());
// Set security HTTP headers
app.use(helmet());
// Limit requests
const limiter = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Data sanitization against Nosql query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(hpp());

// Route uses
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/helpers', helperRoutes);

// Handler for undefined routes
app.use('*', (req,res,next) => {
    const err = new AppError(404,'Not Found','Undefined route.');
    next(err,req,res,next);
});
app.use(globalErrHandler);

module.exports = app;
