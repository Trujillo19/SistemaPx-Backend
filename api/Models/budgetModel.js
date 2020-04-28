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
    Subdireccion: {
        type: String,
        required: true
    },
    GM: {
        type: String,
        required: true
    },
    Autorizado: {
        type: Number,
        required: true
    },
    Ejercicio: {
        type: Number,
        required: true
    },
    Desviación: {
        type: Number,
        required: true
    },
    Avance: {
        type: Number,
        required: true
    },
    Recepcionado: {
        type: Number,
        required: true
    },
    EjercicioEsperado: {
        type: Number,
        required: true
    },
    DesviacionEsperado: {
        type: Number,
        required: true
    },
    PorcentajeEsperado: {
        type: Number,
        required: true
    }

});

budgetModel.pre('save', async (next) => {
    return next();
});

const budget = mongoose.model('budget', budgetModel);
module.exports = budget;
