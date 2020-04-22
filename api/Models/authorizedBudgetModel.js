const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorizedBudgetModel = new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    authorizedName: {
        type: String,
        required: true
    },
    subdireccion: {
        type: [String],
        required:true
    },
    gm: {
        type: [String],
        required:true
    },
    idProyD: {
        type: [String],
        required:true
    },
    concepto: {
        type: [String],
        required:true
    },
    centroGestor: {
        type: [String],
        required:true
    },
    fondo: {
        type: [String],
        required:true
    },
    programaPresupuestal: {
        type: [String],
        required:true
    },
    ePep6Nivel: {
        type: [String],
        required:true
    },
    posicionFinanciera: {
        type: [String],
        required:true
    },
    moneda: {
        type: [String],
        required:true
    },
    contrato: {
        type: [String],
        required:true
    },
    reservaPptal: {
        type: [String],
        required:true
    },
    pedido: {
        type: [String],
        required:true
    },
    dEne: {
        type: [Number],
        required:true
    },
    dFeb: {
        type: [Number],
        required:true
    },
    dMar: {
        type: [Number],
        required:true
    },
    dAbr: {
        type: [Number],
        required:true
    },
    dMay: {
        type: [Number],
        required:true
    },
    dJun: {
        type: [Number],
        required:true
    },
    dJul: {
        type: [Number],
        required:true
    },
    dAgo: {
        type: [Number],
        required:true
    },
    dSep: {
        type: [Number],
        required:true
    },
    dOct: {
        type: [Number],
        required:true
    },
    dNov: {
        type: [Number],
        required:true
    },
    dDic: {
        type: [Number],
        required:true
    },
    fEne: {
        type: [Number],
        required:true
    },
    fFeb: {
        type: [Number],
        required:true
    },
    fMar: {
        type: [Number],
        required:true
    },
    fAbr: {
        type: [Number],
        required:true
    },
    fMay: {
        type: [Number],
        required:true
    },
    fJun: {
        type: [Number],
        required:true
    },
    fJul: {
        type: [Number],
        required:true
    },
    fAgo: {
        type: [Number],
        required:true
    },
    fSep: {
        type: [Number],
        required:true
    },
    fOct: {
        type: [Number],
        required:true
    },
    fNov: {
        type: [Number],
        required:true
    },
    fDic: {
        type: [Number],
        required:true
    },
    fEneAsgte: {
        type: [Number],
        required:true
    },
    fFebAsgte: {
        type: [Number],
        required:true
    },
    fMarAsgte: {
        type: [Number],
        required:true
    },
    fAbrAsgte: {
        type: [Number],
        required:true
    },
    fMayAsgte: {
        type: [Number],
        required:true
    },
    fJunAsgte: {
        type: [Number],
        required:true
    },
    dTotal: {
        type: [Number],
        required:true
    },
    fTotal: {
        type: [Number],
        required:true
    },
    adefaInicial: {
        type: [Number],
        required:true
    },
    adefaFinal: {
        type: [Array],
        required:true
    },
    tipoPresupuesto: {
        type: [String],
        required:true
    }
});

const authorizedBudget = mongoose.model('authorizedBudget', authorizedBudgetModel);
module.exports = authorizedBudget;
