const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exercisedBudgetModel = new mongoose.Schema({
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
    gm: {
        type: [String],
        required:true
    },
    subdireccion: {
        type: [String],
        required:true
    },
    importe: {
        type: [Number],
        required:true
    },
    ledger: {
        type: [String],
        required:true
    },
    entidadCp: {
        type: [String],
        required:true
    },
    ano: {
        type: [Number],
        required:true
    },
    tipodeVa: {
        type: [String],
        required:true
    },
    elementoPep: {
        type: [String]
    },
    fondo: {
        type: [String],
        required:true
    },
    centroGestor: {
        type: [String],
        required:true
    },
    posicionPresupuestal: {
        type: [String],
        required:true
    },
    programaPresupuestal: {
        type: [String],
        required:true
    },
    moneda: {
        type: [String],
        required:true
    },
    periodoFm: {
        type: [Number],
        required:true
    },
    doctoPre: {
        type: [String]
    },
    posDocPr: {
        type: [String],
        required:true
    },
    docFl: {
        type: [String],
        required:true
    },
    contrato: {
        type: [String]
    },
    acreedor: {
        type: [String],
        required:true
    },
    nombreAcreedor: {
        type: [String],
        required:true
    },
    textoCabecera: {
        type: [String]
    },
    referencia: {
        type: [String],
        required:true
    },
    socFl: {
        type: [String],
        required:true
    },
    anoDocFl: {
        type: [String],
        required:true
    },
    textoDePosicion: {
        type: [String]
    },
    fechaCont: {
        type: [Date],
        required:true
    },
    importeFm: {
        type: [Number],
        required:true
    },
    importeDo: {
        type: [Number],
        required:true
    },
    fActCp: {
        type: [Date],
        required:true
    }

});

exercisedBudgetModel.pre('save', async (next) => {
    return next();
});

const exercisedBudget = mongoose.model('exercisedBugget', exercisedBudgetModel);
module.exports = exercisedBudget;


