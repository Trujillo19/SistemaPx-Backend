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
    solPed: {
        type: [String],
        required:true
    },
    solicitudContratacion: {
        type: [String],
        required:true
    },
    folioRaf: {
        type: [String],
        required:true
    },
    folioAres: {
        type: [String],
        required:true
    },
    enTecho: {
        type: [String],
        required:true
    },
    descdeActividad: {
        type: [String],
        required:true
    },
    nuevoRequerimiento: {
        type: [String],
        required:true
    },
    instalacion: {
        type: [String],
        required:true
    },
    idSeguimiento: {
        type: [String],
        required:true
    },
    nombrePozoObraEmbarcacion: {
        type: [String],
        required:true
    },
    asuntosRelevantes: {
        type: [String],
        required:true
    },
    elabora: {
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
    },
    cveAsign: {
        type: [String],
        required:true
    },
    cveSipop: {
        type: [String],
        required:true
    },
    descProgPresup: {
        type: [String],
        required:true
    },
    descElementoPep: {
        type: [String],
        required:true
    },
    integrador: {
        type: [String],
        required:true
    },
    subIntegrador: {
        type: [String],
        required:true
    },
    subEjecutor: {
        type: [String],
        required:true
    },
    ejecutor: {
        type: [String],
        required:true
    },
    rubro: {
        type: [String],
        required:true
    },
    clasifMo: {
        type: [String],
        required:true
    },
    irreducible: {
        type: [String],
        required:true
    },
    rubroIrreducible: {
        type: [String],
        required:true
    },
    progAhorro: {
        type: [String],
        required:true
    },
    anticipos: {
        type: [String],
        required:true
    },
    gpoObra: {
        type: [String],
        required:true
    },
    tipodeProduccion: {
        type: [String],
        required:true
    },
    actividad: {
        type: [String],
        required:true
    },
    contrato9D: {
        type: [String],
        required:true
    },
    supervisor: {
        type: [String],
        required:true
    },
    politicaPago: {
        type: [String],
        required:true
    },
    descContrato: {
        type: [String],
        required:true
    },
    vigencia: {
        type: [String],
        required:true
    },
    compania: {
        type: [String],
        required:true
    },
    saldoContratado: {
        type: [String],
        required:true
    },
    tramiteAresAnuencias: {
        type: [String],
        required:true
    },
    estadoAresAnuencias: {
        type: [String],
        required:true
    },
    tipodeActividad: {
        type: [String],
        required:true
    },
    pozo: {
        type: [String],
        required:true
    },
    equipodePerforacion: {
        type: [String],
        required:true
    },
    embarcacion: {
        type: [String],
        required:true
    },
    costoEquipo: {
        type: [String],
        required:true
    },
    costoIntervencion: {
        type: [String],
        required:true
    },
    fechaInicialPozo: {
        type: [String],
        required:true
    },
    fechaFinalPozo: {
        type: [String],
        required:true
    },
    eFinPozo: {
        type: [String],
        required:true
    },
    costoEmbarcacion: {
        type: [String],
        required:true
    },
    cveUidepProy: {
        type: [String],
        required:true
    },
    proyectoCartera: {
        type: [String],
        required:true
    },
    montoCartera: {
        type: [String],
        required:true
    },
    vigenciaCartera: {
        type: [String],
        required:true
    },
    descAsignacion: {
        type: [String],
        required:true
    },
    saldoAsignacion: {
        type: [String],
        required:true
    },
    numMsjSistema: {
        type: [String],
        required:true
    },
    mensajesdeSistema: {
        type: [String],
        required:true
    },
    nombreVersionAdec: {
        type: [String],
        required:true
    }
});

const authorizedBudget = mongoose.model('authorizedBudget', authorizedBudgetModel);
module.exports = authorizedBudget;
