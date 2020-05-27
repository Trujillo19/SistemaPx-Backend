const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const copadeBudgetModel = new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    CopadeDate: {
        type: Date,
        required: true
    },
    COPADEs: {
        type: [String],
        required: true
    }
});

copadeBudgetModel.pre('save', async (next) => {
    return next();
});

const copadeBudget = mongoose.model('copadeBudget', copadeBudgetModel);
module.exports = copadeBudget;
