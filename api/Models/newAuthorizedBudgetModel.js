const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAuthorizedBudgetModel = new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    authNumber: {
        type: Number,
        required: true
    },
    AA: {
        type: [Number],
        required: true
    },
    CGDUOS: {
        type: [Number],
        required: true
    },
    GMDE: {
        type: [Number],
        required: true
    },
    GMGE: {
        type: [Number],
        required: true
    },
    GMM: {
        type: [Number],
        required: true
    },
    GMOPI: {
        type: [Number],
        required: true
    },
    CSTPIP: {
        type: [Number],
        required: true
    },
    GSMCCIT: {
        type: [Number],
        required: true
    },
    GSSLT: {
        type: [Number],
        required: true
    },
    GMSSTPA: {
        type: [Number],
        required: true
    }
});

newAuthorizedBudgetModel.pre('save', async (next) => {
    return next();
});

const newAuthorizedBudget = mongoose.model('newAuthorizedBudget', newAuthorizedBudgetModel);
module.exports = newAuthorizedBudget;
