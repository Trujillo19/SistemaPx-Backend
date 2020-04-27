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
    }

});

budgetModel.pre('save', async (next) => {
    return next();
});

const budget = mongoose.model('budget', budgetModel);
module.exports = budget;
