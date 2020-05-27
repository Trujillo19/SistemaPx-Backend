const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hojaCopadeModel = new mongoose.Schema({
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
    COPADE: {
        type: Array,
        required: true
    },
    HojadeEntrada: {
        type: Array,
        required: true
    }
});

hojaCopadeModel.pre('save', async (next) => {
    return next();
});

const hojaCopade = mongoose.model('hojaCopade', hojaCopadeModel);
module.exports = hojaCopade;
