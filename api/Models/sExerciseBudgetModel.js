const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetModel = new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    exerciseDate: {
        type: Date,
        required: true
    },
    Subdireccion: {
        type: [String],
        required: true
    },
    GM: {
        type: [String],
        required: true
    },
    Ejercicio: {
        type: [Number],
        required: true
    }
});

budgetModel.pre('save', async (next) => {
    return next();
});

const budget = mongoose.model('budget', budgetModel);
module.exports = budget;
