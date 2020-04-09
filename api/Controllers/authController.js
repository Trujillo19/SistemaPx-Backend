const joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const saltRound = 10;
const User = require('../Models/userModel');
const AppError = require('../Helpers/appError');

// Token creation function
const createToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
// Signup controller
exports.signup = async (req, res, next) => {
    // Joi validation schema
    try {
        const schema = joi.object().keys({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            email: joi.string().required().email(),
            password: joi.string().required(),
            role: joi.string().valid('admin','user')
        });
        const {firstName, lastName, email, password, role} = await schema.validateAsync(req.body);
        // Hashed Password
        const hashedPassword = await bcrypt.hash(password, saltRound);
        // User creation
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role
        });
        // Token creation
        const token = createToken(user._id);
        // Delete password from the response
        user.password = undefined;
        // Send response and token
        return res.status(201).json({
            status: 'Success',
            token,
            data: {
                user
            }
        });
    } catch (err) {
        // If there's a Joi Validation Error, send Bad Request.
        if (err.name === 'ValidationError') {
            return next(new AppError(400, 'Bad Request', err.message));
        }
        return next(err);
    }
};
// Login controller
exports.login = async (req, res, next) => {
    try {
        // Joi validation schema
        const schema = joi.object().keys({
            email: joi.string().required().email(),
            password: joi.string().required()
        });
        const {email, password} = await schema.validateAsync(req.body);
        // Find user by email
        const user = await User.findOne({email});
        // If there is'nt an email, send Unauthorized, don't send too much information.
        if (!user) {
            return next(new AppError(401, 'Unauthorized', 'Email doesn\'t exist or password doesn\'t match'));
        }
        const comparedPassword = await bcrypt.compare(password, user.password);
        // If password doesn't match, send Unauthorized, don't send too much information.
        if (!comparedPassword) {
            return next(new AppError(401, 'Unauthorized', 'Email doesn\'t exist or password doesn\'t match'));
        }
        // If password match, create a token
        const token = createToken(user._id);
        // Delete password from the response
        user.password = undefined;
        // Send response and token
        res.status(200).json({
            status: 'Sucess',
            token,
            data: {
                user
            }
        });
    } catch (err) {
        // If there's a Joi Validation Error, send Bad Request.
        if (err.name === 'ValidationError'){
            return next(new AppError(400, 'Bad Request', err.message));
        }
        return next(err);
    }
};

// Protect middleware
exports.protect = async (req, res, next) => {
    try {
        // Verify if token is present.
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // If it's not, send Unauthorized.
        if (!token) {
            return next(new AppError(401, 'Unauthorized', 'You are not logged in. Please login in to continue'), req, res, next);
        }
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Check if the User exists.
        const user = await User.findById(decode.id);
        if (!user) {
            return next(new AppError(401, 'Unauthorized', 'This user no longer exist'), req, res, next);
        }
        req.user = user.id;
        next();

    } catch (err) {
        next(err);
    }
};

