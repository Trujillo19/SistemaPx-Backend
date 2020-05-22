const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseChartModel = new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    day : {
        type: Number,
        required: true
    },
    exercise: {
        type: Number,
        required: true
    }
});

exerciseChartModel.pre('save', async (next) => {
    return next();
});

const exerciseChart = mongoose.model('exerciseChart', exerciseChartModel);
module.exports = exerciseChart;
