const authorizedBudget = require('../Models/newAuthorizedBudgetModel');
const exercisedBudget = require('../Models/newExerciseBudgetModel');
const receivedBudget = require('../Models/receivedBudgetModel');
const exerciseChart = require('../Models/exerciseChartModel');
const AppError = require('../Helpers/appError');
const numeral = require('../Helpers/numeral');
const Excel = require('exceljs');
const sorter = require('../Helpers/sortExercise');

exports.getBudget = async (req, res, next) => {
    if (!req.query.startDate || !req.query.endDate || !req.query.authName){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var e_AA = 0;
    var e_CGDUOS = 0;
    var e_GMDE = 0;
    var e_GMGE = 0;
    var e_GMM = 0;
    var e_GMOPI = 0;
    var e_CSTPIP = 0;
    var e_GSMCCIT = 0;
    var e_GSSLT = 0;
    var e_GMSSTPA = 0;
    var a_AA = 0;
    var a_CGDUOS = 0;
    var a_GMDE = 0;
    var a_GMGE = 0;
    var a_GMM = 0;
    var a_GMOPI = 0;
    var a_CSTPIP = 0;
    var a_GSMCCIT = 0;
    var a_GSSLT = 0;
    var a_GMSSTPA = 0;
    const startDate = new Date(req.query.startDate+ 'GMT-0600');
    const endDate = new Date(req.query.endDate+ 'GMT-0600');
    const authName = req.query.authName;
    var startMonth = startDate.getMonth();
    var endMonth = endDate.getMonth();
    var monthDiff = endMonth - startMonth;
    if (endDate - startDate < 0 ) {
        return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
    }
    try {
        var exercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
        if (exercise.length === 0){
            return next(new AppError(404, 'Not found', 'There isn\'t data from the selected period'));
        }
        for (i = 0; i < exercise.length; i++) {
            e_AA = e_AA + exercise[i].AA;
            e_CGDUOS = e_CGDUOS+ exercise[i].CGDUOS;
            e_GMDE = e_GMDE + exercise[i].GMDE;
            e_GMGE = e_GMGE + exercise[i].GMGE;
            e_GMM = e_GMM + exercise[i].GMM;
            e_GMOPI = e_GMOPI + exercise[i].GMOPI;
            e_CSTPIP = e_CSTPIP + exercise[i].CSTPIP;
            e_GSMCCIT = e_GSMCCIT + exercise[i].GSMCCIT;
            e_GSSLT = e_GSSLT + exercise[i].GSSLT;
            e_GMSSTPA = e_GMSSTPA + exercise[i].GMSSTPA;
        }
        var authorized = await authorizedBudget.findOne({authName});
        for (j = startMonth; j <= startMonth + monthDiff; j++){
            a_AA = a_AA + authorized.AA[j];
            a_CGDUOS = a_CGDUOS + authorized.CGDUOS[j];
            a_GMDE = a_GMDE + authorized.GMDE[j];
            a_GMGE = a_GMGE + authorized.GMGE[j];
            a_GMM = a_GMM + authorized.GMM[j];
            a_GMOPI = a_GMOPI + authorized.GMOPI[j];
            a_CSTPIP = a_CSTPIP + authorized.CSTPIP[j];
            a_GSMCCIT = a_GSMCCIT + authorized.GSMCCIT[j];
            a_GSSLT = a_GSSLT + authorized.GSSLT[j];
            a_GMSSTPA = a_GMSSTPA + authorized.GMSSTPA[j];
        }
        var received = await receivedBudget.findOne().sort({receivedDate: -1});

        var avanceAA = e_AA / a_AA;
        var avanceCGDUOS = e_CGDUOS / a_CGDUOS;
        var avanceGMDE = e_GMDE / a_GMDE;
        var avanceGMGE = e_GMGE / a_GMGE;
        var avanceGMM = e_GMM / a_GMM;
        var avanceGMOPI = e_GMOPI / a_GMOPI;
        var avanceCSTPIP = e_CSTPIP / a_CSTPIP;
        var avanceGSMCCIT = e_GSMCCIT / a_GSMCCIT;
        var avanceGSSLT = e_GSSLT / a_GSSLT;
        var avanceGMSSTPA = e_GMSSTPA / a_GMSSTPA;
        var avanceEsperadoAA = (received.AA + e_AA) / a_AA;
        var avanceEsperadoCGDUOS = (received.CGDUOS + e_CGDUOS) / a_CGDUOS;
        var avanceEsperadoGMDE = (received.GMDE + e_GMDE)/ a_GMDE;
        var avanceEsperadoGMGE = (received.GMGE + e_GMGE) / a_GMGE;
        var avanceEsperadoGMM = (received.GMM + e_GMM) / a_GMM;
        var avanceEsperadoGMOPI = (received.GMOPI + e_GMOPI) / a_GMOPI;
        var avanceEsperadoCSTPIP = (received.CSTPIP + e_CSTPIP) / a_CSTPIP;
        var avanceEsperadoGSMCCIT = (received.GSMCCIT + e_GSMCCIT) / a_GSMCCIT;
        var avanceEsperadoGSSLT = (received.GSSLT + e_GSSLT) / a_GSSLT;
        var avanceEsperadoGMSSTPA = (received.GMSSTPA + e_GMSSTPA) / a_GMSSTPA;

        var a_SPRN = a_AA + a_CGDUOS + a_GMDE + a_GMGE + a_GMM + a_GMOPI;
        var e_SPRN = e_AA + e_CGDUOS + e_GMDE + e_GMGE + e_GMM + e_GMOPI;
        var avanceSPRN = e_SPRN / a_SPRN;
        var recepcionadoSPRN = received.AA + received.CGDUOS + received.GMDE + received.GMGE + received.GMM + received.GMOPI;
        var avanceEsperadoSPRN = (recepcionadoSPRN + e_SPRN) / a_SPRN;

        var a_SASEP = a_CSTPIP + a_GSMCCIT + a_GSSLT;
        var e_SASEP = e_CSTPIP + e_GSMCCIT + e_GSSLT;
        var avanceSASEP = e_SASEP / a_SASEP;
        var recepcionadoSASEP = received.CSTPIP + received.GSMCCIT + received.GSSLT;
        var avanceEsperadoSASEP = (recepcionadoSASEP + e_SASEP) / a_SASEP;

        var a_SSSTPA = a_GMSSTPA;
        var e_SSSTPA = e_GMSSTPA;
        var avanceSSSTPA = e_SSSTPA / a_SSSTPA;
        var recepcionadoSSSTPA = received.GMSSTPA;
        var avanceEsperadoSSSTPA = (recepcionadoSSSTPA + e_SSSTPA) / a_SSSTPA;

        var a_Total = a_SPRN + a_SASEP + a_SSSTPA;
        var e_Total = e_SPRN + e_SASEP + e_SSSTPA;
        var avanceTotal = e_Total / a_Total;
        var recepcionadoTotal = recepcionadoSPRN + recepcionadoSASEP + recepcionadoSSSTPA;
        var avanceEsperadoTotal = (recepcionadoTotal + e_Total) / a_Total;
        res.status(200).json({
            status: 'Success',
            data: [
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'AA',
                    'Autorizado': numeral(a_AA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_AA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_AA - a_AA).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceAA ? avanceAA : 0).format('0%'),
                    'Recepcionado': numeral(received.AA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.AA + e_AA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.AA + e_AA) - a_AA).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoAA) ? avanceEsperadoAA : 0).format('0%'),
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'CGDUOS',
                    'Autorizado': numeral(a_CGDUOS).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_CGDUOS).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_CGDUOS - a_CGDUOS).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceCGDUOS ? avanceCGDUOS : 0).format('0%'),
                    'Recepcionado': numeral(received.CGDUOS).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.CGDUOS + e_CGDUOS).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.CGDUOS + e_CGDUOS) - a_CGDUOS).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoCGDUOS) ? avanceEsperadoCGDUOS : 0).format('0%'),
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMDE',
                    'Autorizado': numeral(a_GMDE).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMDE).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMDE - a_GMDE).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGMDE ? avanceGMDE : 0).format('0%'),
                    'Recepcionado': numeral(received.GMDE).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMDE + e_GMDE).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMDE + e_GMDE) - a_GMDE).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMDE) ? avanceEsperadoGMDE : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMGE',
                    'Autorizado': numeral(a_GMGE).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMGE).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMGE - a_GMGE).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGMGE ? avanceGMGE : 0).format('0%'),
                    'Recepcionado': numeral(received.GMGE).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMGE + e_GMGE).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMGE + e_GMGE) - a_GMGE).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMGE) ? avanceEsperadoGMGE : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMM',
                    'Autorizado': numeral(a_GMM).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMM).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMM - a_GMM).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGMM ? avanceGMM : 0).format('0%'),
                    'Recepcionado': numeral(received.GMM).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMM + e_GMM).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMM + e_GMM) - a_GMM).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMM) ? avanceEsperadoGMM : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMOPI',
                    'Autorizado': numeral(a_GMOPI).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMOPI).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMOPI - a_GMOPI).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGMOPI ? avanceGMOPI : 0).format('0%'),
                    'Recepcionado': numeral(received.GMOPI).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMOPI + e_GMOPI).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMOPI + e_GMOPI) - a_GMOPI).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMOPI) ? avanceEsperadoGMOPI : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'Subtotal',
                    'Autorizado': numeral(a_SPRN).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SPRN).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SPRN - a_SPRN).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceSPRN ? avanceSPRN : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSPRN).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSPRN + e_SPRN).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSPRN + e_SPRN) - a_SPRN).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSPRN) ? avanceEsperadoSPRN : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'CSTPIP',
                    'Autorizado': numeral(a_CSTPIP).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_CSTPIP).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_CSTPIP - a_CSTPIP).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceCSTPIP ? avanceCSTPIP : 0).format('0%'),
                    'Recepcionado': numeral(received.CSTPIP).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.CSTPIP + e_CSTPIP).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.CSTPIP + e_CSTPIP) - a_CSTPIP).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoCSTPIP) ? avanceEsperadoCSTPIP : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'GSMCCIT',
                    'Autorizado': numeral(a_GSMCCIT).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GSMCCIT).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GSMCCIT - a_GSMCCIT).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGSMCCIT ? avanceGSMCCIT : 0).format('0%'),
                    'Recepcionado': numeral(received.GSMCCIT).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GSMCCIT + e_GSMCCIT).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GSMCCIT + e_GSMCCIT) - a_GSMCCIT).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGSMCCIT) ? avanceEsperadoGSMCCIT : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'GSSLT',
                    'Autorizado': numeral(a_GSSLT).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GSSLT).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GSSLT - a_GSSLT).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGSSLT ? avanceGSSLT : 0).format('0%'),
                    'Recepcionado': numeral(received.GSSLT).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GSSLT + e_GSSLT).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GSSLT + e_GSSLT) - a_GSSLT).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGSSLT) ? avanceEsperadoGSSLT : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'Subtotal',
                    'Autorizado': numeral(a_SASEP).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SASEP).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SASEP - a_SASEP).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceSASEP ? avanceSASEP : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSASEP).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSASEP + e_SASEP).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSASEP + e_SASEP) - a_SASEP).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSASEP) ? avanceEsperadoSASEP : 0).format('0%')
                },
                {
                    'Subdirección':'SSSTPA',
                    'GM': 'GMSSTPA',
                    'Autorizado': numeral(a_GMSSTPA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMSSTPA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMSSTPA - a_GMSSTPA).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceGMSSTPA ? avanceGMSSTPA : 0).format('0%'),
                    'Recepcionado': numeral(received.GMSSTPA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMSSTPA + e_GMSSTPA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMSSTPA + e_GMSSTPA) - a_GMSSTPA).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMSSTPA) ? avanceEsperadoGMSSTPA : 0).format('0%')
                },
                {
                    'Subdirección':'SSSTPA',
                    'GM': 'Subtotal',
                    'Autorizado': numeral(a_SSSTPA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SSSTPA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SSSTPA - a_SSSTPA).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceSSSTPA ? avanceSSSTPA : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSSSTPA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSSSTPA + e_SSSTPA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSSSTPA + e_SSSTPA) - a_SSSTPA).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSSSTPA) ? avanceEsperadoSSSTPA : 0).format('0%')
                },
                {
                    'Subdirección':'Total Inversión',
                    'GM': ' ',
                    'Autorizado': numeral(a_Total).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_Total).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_Total - a_Total).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceTotal ? avanceTotal : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoTotal).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoTotal + e_Total).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoTotal + e_Total) - a_Total).divide(1000000).format('0.0'),
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoTotal) ? avanceEsperadoTotal : 0).format('0%')
                },
            ],

        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postAuthorized = async (req, res, next) => {
    if (!req.file || !req.body.sheetName || !req.body.authName){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var sheetName = req.body.sheetName;
    var filepath = './' + req.file.path;
    var user = req.user;
    var authName = req.body.authName;
    var AA = [];
    var CGDUOS = [];
    var GMDE = [];
    var GMGE = [];
    var GMM = [];
    var GMOPI = [];
    var CSTPIP = [];
    var GSMCCIT = [];
    var GSSLT = [];
    var GMSSTPA = [];
    for (k=0; k<=11; k++){
        AA[k] = 0;
        CGDUOS[k] = 0;
        GMDE[k] = 0;
        GMGE[k] = 0;
        GMM[k] = 0;
        GMOPI[k] = 0;
        CSTPIP[k] = 0;
        GSMCCIT[k] = 0;
        GSSLT[k] = 0;
        GMSSTPA[k] = 0;
    }
    try {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row, rowNumber) => {
                if(rowNumber !== 1){
                    row.eachCell((cell, colNumber) => {
                        inputRow.push(cell.value);
                    });
                    switch (inputRow[1]) {
                        case 'AA':
                            for (i=0; i<=11; i++){
                                AA[i] = AA[i] + inputRow[9+i];
                            }
                            break;
                        case 'CGDUOS':
                            for (i=0; i<=11; i++){
                                CGDUOS[i] = CGDUOS[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMDE':
                            for (i=0; i<=11; i++){
                                GMDE[i] = GMDE[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMGE':
                            for (i=0; i<=11; i++){
                                GMGE[i] = GMGE[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMM':
                            for (i=0; i<=11; i++){
                                GMM[i] = GMM[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMOPI':
                            for (i=0; i<=11; i++){
                                GMOPI[i] = GMOPI[i] + inputRow[9+i];
                            }
                            break;
                        case 'CSTPIP':
                            for (i=0; i<=11; i++){
                                CSTPIP[i] = CSTPIP[i] + inputRow[9+i];
                            }
                            break;
                        case 'GSMCCIT':
                            for (i=0; i<=11; i++){
                                GSMCCIT[i] = GSMCCIT[i] + inputRow[9+i];
                            }
                            break;
                        case 'GSSLT':
                            for (i=0; i<=11; i++){
                                GSSLT[i] = GSSLT[i] + inputRow[9+i];
                            }
                            break;
                        case 'SSSTPA':
                            for (i=0; i<=11; i++){
                                GMSSTPA[i] = GMSSTPA[i] + inputRow[9+i];
                            }
                            break;
                    }
                }
                inputRow = [];
            });
            var autorizado = await authorizedBudget.create({createdBy: user, createdAt: Date.now(),
                authName, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            res.status(201).json({
                status: 'Created',
                data: {
                    autorizado
                }
            });
        }).catch( (err) => {
            console.log(err);
            return next(new AppError(500, 'Server error', err.message));
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.postExercised = async (req, res, next) => {
    if (!req.file || !req.body.sheetName || !req.body.inputDate){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var inputDate = new Date(req.body.inputDate + 'GMT-0600');
    var sheetName = req.body.sheetName;
    var filepath =  './' + req.file.path;
    var user = req.user;
    var AA = 0;
    var CGDUOS = 0;
    var GMDE = 0;
    var GMGE = 0;
    var GMM = 0;
    var GMOPI = 0;
    var CSTPIP = 0;
    var GSMCCIT = 0;
    var GSSLT = 0;
    var GMSSTPA = 0;
    const colCentroGestor = 6;
    const colPosicionFinanciera = 7;
    const colPosicionPresupuestal = 8;
    const colContrato = 14;
    const colImporte = 23;
    var inputRow = [];
    try {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row,rowNumber) => {
                if (rowNumber !== 1){
                    row.eachCell((cell, colNumber) => {
                        inputRow.push(cell.value);
                    });
                    var outputRow = sorter.sort(inputRow,colCentroGestor,colPosicionFinanciera,
                        colPosicionPresupuestal,colContrato,colImporte);
                    switch (outputRow[0]) {
                        case 'AA':
                            AA = AA + outputRow[2];
                            break;
                        case 'CGDUOS':
                            CGDUOS = CGDUOS + outputRow[2];
                            break;
                        case 'GMDE':
                            GMDE = GMDE + outputRow[2];
                            break;
                        case 'GMGE':
                            GMGE = GMGE + outputRow[2];
                            break;
                        case 'GMM':
                            GMM = GMM + outputRow[2];
                            break;
                        case 'GMOPI':
                            GMOPI = GMOPI + outputRow[2];
                            break;
                        case 'CSTPIP':
                            CSTPIP = CSTPIP + outputRow[2];
                            break;
                        case 'GSMCCIT':
                            GSMCCIT = GSMCCIT + outputRow[2];
                            break;
                        case 'GSSLT':
                            GSSLT = GSSLT + outputRow[2];
                            break;
                        case 'GMSSTPA':
                            GMSSTPA = GMSSTPA + outputRow[2];
                            break;
                    }
                }
                inputRow = [];
            });
            var today = new Date();
            var total = AA + CGDUOS + GMDE + GMGE + GMM + GMOPI + CSTPIP + GSMCCIT + GSSLT + GMSSTPA;
            var dia = today.getDate();
            var exerciseTotalChart = await exerciseChart.create({createdBy: user, day:dia, exercise: total });
            var exercise = await exercisedBudget.create({createdBy: user, createdAt: Date.now(),
                exerciseDate: inputDate, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            res.status(201).json({
                status: 'Created',
                data: {
                    exercise
                }
            });
        }).catch((err) => {
            console.log(err);
            return next(new AppError(500, 'Server error', err.message));
        });
    }
    catch (err) {
        return next(err);
    }
};

exports.postReceived = async (req, res, next) => {
    if (!req.file || !req.body.sheetName || !req.body.receivedDate){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var sheetName = req.body.sheetName;
    var receivedDate = req.body.receivedDate;
    var filepath =  './' + req.file.path;
    var user = req.user;
    var AA = 0;
    var CGDUOS = 0;
    var GMDE = 0;
    var GMGE = 0;
    var GMM = 0;
    var GMOPI = 0;
    var CSTPIP = 0;
    var GSMCCIT = 0;
    var GSSLT = 0;
    var GMSSTPA = 0;
    const colCentroGestor = 8;
    const colPosicionFinanciera = 9;
    const colPosicionPresupuestal = 10;
    const colContrato = 3;
    var inputRow = [];
    try {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row,rowNumber) => {
                if (rowNumber !== 1){
                    row.eachCell((cell, colNumber) => {
                        inputRow.push(cell.value);
                    });
                    var outputRow = sorter.generalSort(inputRow,colCentroGestor,colPosicionFinanciera,
                        colPosicionPresupuestal,colContrato);
                    switch (outputRow[0]) {
                        case 'AA':
                            AA = AA + outputRow[23];
                            break;
                        case 'CGDUOS':
                            CGDUOS = CGDUOS + outputRow[23];
                            break;
                        case 'GMDE':
                            GMDE = GMDE + outputRow[23];
                            break;
                        case 'GMGE':
                            GMGE = GMGE + outputRow[23];
                            break;
                        case 'GMM':
                            GMM = GMM + outputRow[23];
                            break;
                        case 'GMOPI':
                            GMOPI = GMOPI + outputRow[23];
                            break;
                        case 'CSTPIP':
                            CSTPIP = CSTPIP + outputRow[23];
                            break;
                        case 'GSMCCIT':
                            GSMCCIT = GSMCCIT + outputRow[23];
                            break;
                        case 'GSSLT':
                            GSSLT = GSSLT + outputRow[23];
                            break;
                        case 'GMSSTPA':
                            GMSSTPA = GMSSTPA + outputRow[23];
                            break;
                    }
                }
                inputRow = [];
            });
            var received = await receivedBudget.create({createdBy: user, createdAt: Date.now(),
                receivedDate: receivedDate, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            res.status(201).json({
                status: 'Created',
                data: {
                    received
                }
            });
        }).catch ((err) => {
            console.log(err);
            return next(new AppError(500, 'Server error', err.message));
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getPresentation = async (req, res, next) => {
    if (!req.query.startDate || !req.query.endDate || !req.query.authName){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var mesInicial;
    var mesFinal;
    const startDate = new Date(req.query.startDate+ 'GMT-0600');
    const endDate = new Date(req.query.endDate+ 'GMT-0600');
    var monthDiff = endDate.getMonth() - startDate.getMonth();
    switch (startDate.getMonth()) {
        case 0:
            mesInicial = 'enero';
            break;
        case 1:
            mesInicial = 'febrero';
            break;
        case 2:
            mesInicial = 'marzo';
            break;
        case 3:
            mesInicial = 'abril';
            break;
        case 4:
            mesInicial = 'mayo';
            break;
        case 5:
            mesInicial = 'junio';
            break;
        case 6:
            mesInicial = 'julio';
            break;
        case 7:
            mesInicial = 'agosto';
            break;
        case 8:
            mesInicial = 'septiembre';
            break;
        case 9:
            mesInicial = 'octubre';
            break;
        case 10:
            mesInicial = 'noviembre';
            break;
        case 11:
            mesInicial = 'diciembre';
            break;
    }
    switch (endDate.getMonth()) {
        case 0:
            mesFinal = 'enero';
            break;
        case 1:
            mesFinal = 'febrero';
            break;
        case 2:
            mesFinal = 'marzo';
            break;
        case 3:
            mesFinal = 'abril';
            break;
        case 4:
            mesFinal = 'mayo';
            break;
        case 5:
            mesFinal = 'junio';
            break;
        case 6:
            mesFinal = 'julio';
            break;
        case 7:
            mesFinal = 'agosto';
            break;
        case 8:
            mesFinal = 'septiembre';
            break;
        case 9:
            mesFinal = 'octubre';
            break;
        case 10:
            mesFinal = 'noviembre';
            break;
        case 11:
            mesFinal = 'diciembre';
            break;
    }
    // New vars
    var realChart = [];
    var adecChart = [];
    var realTable = [];
    var adecTableSuma = 0;
    var realTableSuma = 0;
    var avance = 0;
    var adecSumaAvance = 0;
    var tableAA = [];
    var tableCGDUOS = [];
    var tableGMDE = [];
    var tableGMGE = [];
    var tableGMM = [];
    var tableGMOPI = [];
    var tableSPRN = [];
    var tableCSTPIP = [];
    var tableGSMCCIT = [];
    var tableGSSLT = [];
    var tableSASEP = [];
    var tableGMSSTPA = [];
    var tableSSSTPA = [];
    var tableInversion = [];
    var tableAARecepcionado = [];
    var tableCGDUOSRecepcionado = [];
    var tableGMDERecepcionado = [];
    var tableGMGERecepcionado = [];
    var tableGMMRecepcionado = [];
    var tableGMOPIRecepcionado = [];
    var tableSPRNRecepcionado = [];
    var tableCSTPIPRecepcionado = [];
    var tableGMCCITRecepcionado = [];
    var tableGSSLTRecepcionado = [];
    var tableSASEPRecepcionado = [];
    var tableGMSSTPARecepcionado = [];
    var tableSSSTPARecepcionado = [];
    var tableTotalInversionRecepcionado = [];
    var e_AA = 0;
    var e_CGDUOS = 0;
    var e_GMDE = 0;
    var e_GMGE = 0;
    var e_GMM = 0;
    var e_GMOPI = 0;
    var e_CSTPIP = 0;
    var e_GSMCCIT = 0;
    var e_GSSLT = 0;
    var e_GMSSTPA = 0;
    var a_AA = 0;
    var a_CGDUOS = 0;
    var a_GMDE = 0;
    var a_GMGE = 0;
    var a_GMM = 0;
    var a_GMOPI = 0;
    var a_CSTPIP = 0;
    var a_GSMCCIT = 0;
    var a_GSSLT = 0;
    var a_GMSSTPA = 0;
    const authName = req.query.authName;
    if (endDate - startDate < 0 ) {
        return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
    }
    try {
        var authorized = await authorizedBudget.findOne({authName});
        var exercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
        var received = await receivedBudget.findOne().sort({receivedDate: -1});
        var chartEjercicio = await exerciseChart.find();
        console.log(chartEjercicio);
        for (j = startDate.getMonth(); j <= startDate.getMonth() + monthDiff; j++){
            a_AA = a_AA + authorized.AA[j];
            a_CGDUOS = a_CGDUOS + authorized.CGDUOS[j];
            a_GMDE = a_GMDE + authorized.GMDE[j];
            a_GMGE = a_GMGE + authorized.GMGE[j];
            a_GMM = a_GMM + authorized.GMM[j];
            a_GMOPI = a_GMOPI + authorized.GMOPI[j];
            a_CSTPIP = a_CSTPIP + authorized.CSTPIP[j];
            a_GSMCCIT = a_GSMCCIT + authorized.GSMCCIT[j];
            a_GSSLT = a_GSSLT + authorized.GSSLT[j];
            a_GMSSTPA = a_GMSSTPA + authorized.GMSSTPA[j];
        }
        if (exercise.length === 0){
            return next(new AppError(404, 'Not found', 'There isn\'t data from the selected period'));
        }
        for (j = 0; j <= 11; j++){
            adecChart[j] = authorized.AA[j] + authorized.CGDUOS[j] + authorized.GMDE[j] + authorized.GMGE[j] +
            authorized.GMM[j] + authorized.GMOPI[j] + authorized.CSTPIP[j] + authorized.GSMCCIT[j]+ authorized.GSSLT[j] + authorized.GMSSTPA[j];
            adecTableSuma = adecTableSuma + adecChart[j];
            adecChart[j] = numeral(adecChart[j]).divide(1000000).format('0');
        }
        for (i = 0; i < exercise.length; i++) {
            realChart[i] = exercise[i].AA + exercise[i].CGDUOS + exercise[i].GMDE + exercise[i].GMGE + exercise[i].GMM + exercise[i].GMOPI +
            exercise[i].CSTPIP + exercise[i].GSMCCIT + exercise[i].GSSLT + exercise[i].GMSSTPA;
            realTableSuma = realTableSuma + realChart[i];
            realChart[i] = numeral(realChart[i]).divide(1000000).format('0');
            realTable[i] = realChart[i];
            adecSumaAvance = adecSumaAvance + parseInt(adecChart[i]);
            e_AA = e_AA + exercise[i].AA;
            e_CGDUOS = e_CGDUOS+ exercise[i].CGDUOS;
            e_GMDE = e_GMDE + exercise[i].GMDE;
            e_GMGE = e_GMGE + exercise[i].GMGE;
            e_GMM = e_GMM + exercise[i].GMM;
            e_GMOPI = e_GMOPI + exercise[i].GMOPI;
            e_CSTPIP = e_CSTPIP + exercise[i].CSTPIP;
            e_GSMCCIT = e_GSMCCIT + exercise[i].GSMCCIT;
            e_GSSLT = e_GSSLT + exercise[i].GSSLT;
            e_GMSSTPA = e_GMSSTPA + exercise[i].GMSSTPA;
        }
        realTableSuma =  numeral(realTableSuma).divide(1000000).format('0');
        for (i=realTable.length; i<12; i++){
            realTable.push('');
        }
        adecTableSuma =  numeral(adecTableSuma).divide(1000000).format('0');
        avance = numeral(realTableSuma / adecSumaAvance).format('0%');
        var avanceAA = e_AA / a_AA;
        var avanceCGDUOS = e_CGDUOS / a_CGDUOS;
        var avanceGMDE = e_GMDE / a_GMDE;
        var avanceGMGE = e_GMGE / a_GMGE;
        var avanceGMM = e_GMM / a_GMM;
        var avanceGMOPI = e_GMOPI / a_GMOPI;
        var avanceCSTPIP = e_CSTPIP / a_CSTPIP;
        var avanceGSMCCIT = e_GSMCCIT / a_GSMCCIT;
        var avanceGSSLT = e_GSSLT / a_GSSLT;
        var avanceGMSSTPA = e_GMSSTPA / a_GMSSTPA;
        var avanceEsperadoAA = (received.AA + e_AA) / a_AA;
        var avanceEsperadoCGDUOS = (received.CGDUOS + e_CGDUOS) / a_CGDUOS;
        var avanceEsperadoGMDE = (received.GMDE + e_GMDE)/ a_GMDE;
        var avanceEsperadoGMGE = (received.GMGE + e_GMGE) / a_GMGE;
        var avanceEsperadoGMM = (received.GMM + e_GMM) / a_GMM;
        var avanceEsperadoGMOPI = (received.GMOPI + e_GMOPI) / a_GMOPI;
        var avanceEsperadoCSTPIP = (received.CSTPIP + e_CSTPIP) / a_CSTPIP;
        var avanceEsperadoGSMCCIT = (received.GSMCCIT + e_GSMCCIT) / a_GSMCCIT;
        var avanceEsperadoGSSLT = (received.GSSLT + e_GSSLT) / a_GSSLT;
        var avanceEsperadoGMSSTPA = (received.GMSSTPA + e_GMSSTPA) / a_GMSSTPA;
        var a_SPRN = a_AA + a_CGDUOS + a_GMDE + a_GMGE + a_GMM + a_GMOPI;
        var e_SPRN = e_AA + e_CGDUOS + e_GMDE + e_GMGE + e_GMM + e_GMOPI;
        var a_SASEP = a_CSTPIP + a_GSMCCIT + a_GSSLT;
        var e_SASEP = e_CSTPIP + e_GSMCCIT + e_GSSLT;
        var avanceSASEP = e_SASEP / a_SASEP;
        var avanceSPRN = e_SPRN / a_SPRN;
        var a_SSSTPA = a_GMSSTPA;
        var e_SSSTPA = e_GMSSTPA;
        var avanceSSSTPA = e_SSSTPA / a_SSSTPA;
        var a_Total = a_SPRN + a_SASEP + a_SSSTPA;
        var e_Total = e_SPRN + e_SASEP + e_SSSTPA;
        var avanceTotal = e_Total / a_Total;
        var recepcionadoSPRN = received.AA + received.CGDUOS + received.GMDE + received.GMGE + received.GMM + received.GMOPI;
        var avanceEsperadoSPRN = (recepcionadoSPRN + e_SPRN) / a_SPRN;
        var recepcionadoSASEP = received.CSTPIP + received.GSMCCIT + received.GSSLT;
        var avanceEsperadoSASEP = (recepcionadoSASEP + e_SASEP) / a_SASEP;
        var recepcionadoSSSTPA = received.GMSSTPA;
        var avanceEsperadoSSSTPA = (recepcionadoSSSTPA + e_SSSTPA) / a_SSSTPA;
        var recepcionadoTotal = recepcionadoSPRN + recepcionadoSASEP + recepcionadoSSSTPA;
        var avanceEsperadoTotal = (recepcionadoTotal + e_Total) / a_Total;
        tableAA = ['SPRN', 'AA', numeral(a_AA).divide(1000000).format('0.0'), numeral(e_AA).divide(1000000).format('0.0'),  numeral(e_AA - a_AA).divide(1000000).format('0.0'), numeral(avanceAA ? avanceAA : 0).format('0%')];
        tableCGDUOS = ['', 'CGDUOS', numeral(a_CGDUOS).divide(1000000).format('0.0'), numeral(e_CGDUOS).divide(1000000).format('0.0'),  numeral(e_CGDUOS - a_CGDUOS).divide(1000000).format('0.0'), numeral(avanceCGDUOS ? avanceCGDUOS : 0).format('0%') ];
        tableGMDE = ['', 'GMDE', numeral(a_GMDE).divide(1000000).format('0.0'), numeral(e_GMDE).divide(1000000).format('0.0'),  numeral(e_GMDE - a_GMDE).divide(1000000).format('0.0'), numeral(avanceGMDE ? avanceGMDE : 0).format('0%') ];
        tableGMGE = ['', 'GMGE', numeral(a_GMGE).divide(1000000).format('0.0'), numeral(e_GMGE).divide(1000000).format('0.0'),  numeral(e_GMGE - a_GMGE).divide(1000000).format('0.0'), numeral(avanceGMGE ? avanceGMGE : 0).format('0%') ];
        tableGMM = ['', 'GMM', numeral(a_GMM).divide(1000000).format('0.0'), numeral(e_GMM).divide(1000000).format('0.0'),  numeral(e_GMM - a_GMM).divide(1000000).format('0.0'), numeral(avanceGMM ? avanceGMM : 0).format('0%') ];
        tableGMOPI = ['', 'GMOPI', numeral(a_GMOPI).divide(1000000).format('0.0'), numeral(e_GMOPI).divide(1000000).format('0.0'),  numeral(e_GMOPI - a_GMOPI).divide(1000000).format('0.0'), numeral(avanceGMOPI ? avanceGMOPI : 0).format('0%') ];
        tableSPRN = ['Total SPRN APV', numeral(a_SPRN).divide(1000000).format('0.0'), numeral(e_SPRN).divide(1000000).format('0.0'),  numeral(e_SPRN - a_SPRN).divide(1000000).format('0.0'), numeral(avanceSPRN ? avanceSPRN : 0).format('0%') ];
        tableCSTPIP = ['SASEP', 'CSTPIP', numeral(a_CSTPIP).divide(1000000).format('0.0'), numeral(e_CSTPIP).divide(1000000).format('0.0'),  numeral(e_CSTPIP - a_CSTPIP).divide(1000000).format('0.0'), numeral(avanceCSTPIP ? avanceCSTPIP : 0).format('0%') ];
        tableGSMCCIT = ['', 'GSMCCIT', numeral(a_GSMCCIT).divide(1000000).format('0.0'), numeral(e_GSMCCIT).divide(1000000).format('0.0'),  numeral(e_GSMCCIT - a_GSMCCIT).divide(1000000).format('0.0'), numeral(avanceGSMCCIT ? avanceGSMCCIT : 0).format('0%') ];
        tableGSSLT = ['', 'GSSLT', numeral(a_GSSLT).divide(1000000).format('0.0'), numeral(e_GSSLT).divide(1000000).format('0.0'),  numeral(e_GSSLT - a_GSSLT).divide(1000000).format('0.0'), numeral(avanceGSSLT ? avanceGSSLT : 0).format('0%') ];
        tableSASEP = ['Total SASEP', numeral(a_SASEP).divide(1000000).format('0.0'), numeral(e_SASEP).divide(1000000).format('0.0'),  numeral(e_SASEP - a_SASEP).divide(1000000).format('0.0'), numeral(avanceSASEP ? avanceSASEP : 0).format('0%') ];
        tableGMSSTPA = ['SSSTPA', 'GMSSTPA', numeral(a_GMSSTPA).divide(1000000).format('0.0'), numeral(e_GMSSTPA).divide(1000000).format('0.0'),  numeral(e_GMSSTPA - a_GMSSTPA).divide(1000000).format('0.0'), numeral(avanceGMSSTPA ? avanceGMSSTPA : 0).format('0%') ];
        tableSSSTPA = ['Total SSSTPA', numeral(a_SSSTPA).divide(1000000).format('0.0'), numeral(e_SSSTPA).divide(1000000).format('0.0'),  numeral(e_SSSTPA - a_SSSTPA).divide(1000000).format('0.0'), numeral(avanceSSSTPA ? avanceSSSTPA : 0).format('0%') ];
        tableInversion = ['Total Inversión', numeral(a_Total).divide(1000000).format('0.0'), numeral(e_Total).divide(1000000).format('0.0'),  numeral(e_Total - a_Total).divide(1000000).format('0.0'), numeral(avanceTotal ? avanceTotal : 0).format('0%') ];
        tableAARecepcionado = [numeral(received.AA).divide(1000000).format('0.0'), numeral(received.AA + e_AA).divide(1000000).format('0.0'),  numeral((received.AA + e_AA) - a_AA).divide(1000000).format('0.0'), numeral(avanceEsperadoAA ? avanceEsperadoAA : 0).format('0%') ];
        tableCGDUOSRecepcionado = [numeral(received.CGDUOS).divide(1000000).format('0.0'), numeral(received.CGDUOS + e_CGDUOS).divide(1000000).format('0.0'),  numeral((received.CGDUOS + e_CGDUOS) - a_CGDUOS).divide(1000000).format('0.0'), numeral(avanceEsperadoCGDUOS ? avanceEsperadoCGDUOS : 0).format('0%') ];
        tableGMDERecepcionado = [numeral(received.GMDE).divide(1000000).format('0.0'), numeral(received.GMDE + e_GMDE).divide(1000000).format('0.0'),  numeral((received.GMDE + e_GMDE) - a_GMDE).divide(1000000).format('0.0'), numeral(avanceEsperadoGMDE ? avanceEsperadoGMDE : 0).format('0%') ];
        tableGMGERecepcionado = [numeral(received.GMGE).divide(1000000).format('0.0'), numeral(received.GMGE + e_GMGE).divide(1000000).format('0.0'),  numeral((received.GMGE + e_GMGE) - a_GMGE).divide(1000000).format('0.0'), numeral(avanceEsperadoGMGE ? avanceEsperadoGMGE : 0).format('0%') ];
        tableGMMRecepcionado = [numeral(received.GMM).divide(1000000).format('0.0'), numeral(received.GMM + e_GMM).divide(1000000).format('0.0'),  numeral((received.GMM + e_GMM) - a_GMM).divide(1000000).format('0.0'), numeral(avanceEsperadoGMM ? avanceEsperadoGMM : 0).format('0%') ];
        tableGMOPIRecepcionado = [numeral(received.GMOPI).divide(1000000).format('0.0'), numeral(received.GMOPI + e_GMOPI).divide(1000000).format('0.0'),  numeral((received.GMOPI + e_GMOPI) - a_GMOPI).divide(1000000).format('0.0'), numeral(avanceEsperadoGMOPI ? avanceEsperadoGMOPI : 0).format('0%') ];
        tableSPRNRecepcionado = [numeral(recepcionadoSPRN).divide(1000000).format('0.0'), numeral(recepcionadoSPRN + e_SPRN).divide(1000000).format('0.0'),  numeral((recepcionadoSPRN + e_SPRN) - a_SPRN).divide(1000000).format('0.0'), numeral(avanceEsperadoSPRN ? avanceEsperadoSPRN : 0).format('0%') ];
        tableCSTPIPRecepcionado = [numeral(received.CSTPIP).divide(1000000).format('0.0'), numeral(received.CSTPIP + e_CSTPIP).divide(1000000).format('0.0'),  numeral((received.CSTPIP + e_CSTPIP) - a_CSTPIP).divide(1000000).format('0.0'), numeral(avanceEsperadoCSTPIP ? avanceEsperadoCSTPIP : 0).format('0%') ];
        tableGMCCITRecepcionado = [numeral(received.GSMCCIT).divide(1000000).format('0.0'), numeral(received.GSMCCIT + e_GSMCCIT).divide(1000000).format('0.0'),  numeral((received.GSMCCIT + e_GSMCCIT) - a_GSMCCIT).divide(1000000).format('0.0'), numeral(avanceEsperadoGSMCCIT ? avanceEsperadoGSMCCIT : 0).format('0%') ];
        tableGSSLTRecepcionado = [numeral(received.GSSLT).divide(1000000).format('0.0'), numeral(received.GSSLT + e_GSSLT).divide(1000000).format('0.0'),  numeral((received.GSSLT + e_GSSLT) - a_GSSLT).divide(1000000).format('0.0'), numeral(avanceEsperadoGSSLT ? avanceEsperadoGSSLT : 0).format('0%') ];
        tableSASEPRecepcionado = [numeral(recepcionadoSASEP).divide(1000000).format('0.0'), numeral(recepcionadoSASEP + e_SASEP).divide(1000000).format('0.0'),  numeral((recepcionadoSASEP + e_SASEP) - a_SASEP).divide(1000000).format('0.0'), numeral(avanceEsperadoSASEP ? avanceEsperadoSASEP : 0).format('0%') ];
        tableGMSSTPARecepcionado = [numeral(received.GMSSTPA).divide(1000000).format('0.0'), numeral(received.GMSSTPA + e_GMSSTPA).divide(1000000).format('0.0'),  numeral((received.GMSSTPA + e_GMSSTPA) - a_GMSSTPA).divide(1000000).format('0.0'), numeral(avanceEsperadoGMSSTPA ? avanceEsperadoGMSSTPA : 0).format('0%') ];
        tableSSSTPARecepcionado = [numeral(recepcionadoSSSTPA).divide(1000000).format('0.0'), numeral(recepcionadoSSSTPA + e_SSSTPA).divide(1000000).format('0.0'),  numeral((recepcionadoSSSTPA + e_SSSTPA) - a_SSSTPA).divide(1000000).format('0.0'), numeral(avanceEsperadoSSSTPA ? avanceEsperadoSSSTPA : 0).format('0%') ];
        tableTotalInversionRecepcionado = [numeral(recepcionadoTotal).divide(1000000).format('0.0'), numeral(recepcionadoTotal + e_Total).divide(1000000).format('0.0'),  numeral((recepcionadoTotal + e_Total) - a_Total).divide(1000000).format('0.0'), numeral(avanceEsperadoTotal ? avanceEsperadoTotal : 0).format('0%') ];
        6
13
20
27
3
10
17
24
2
9
16
23
30
6
13
20
27
4
11
18
        var dias = []
        res.status(200).json({
            status: 'Success',
            mesInicial,
            mesFinal,
            realChart,
            adecChart,
            realTable,
            adecTableSuma,
            realTableSuma,
            adecSumaAvance,
            avance,
            dias,
            totalEjercicio,
            tableAA,
            tableCGDUOS,
            tableGMDE,
            tableGMGE,
            tableGMM,
            tableGMOPI,
            tableSPRN,
            tableCSTPIP,
            tableGSMCCIT,
            tableGSSLT,
            tableSASEP,
            tableGMSSTPA,
            tableSSSTPA,
            tableInversion,
            tableAARecepcionado,
            tableCGDUOSRecepcionado,
            tableGMDERecepcionado,
            tableGMGERecepcionado,
            tableGMMRecepcionado,
            tableGMOPIRecepcionado,
            tableSPRNRecepcionado,
            tableCSTPIPRecepcionado,
            tableGMCCITRecepcionado,
            tableGSSLTRecepcionado,
            tableSASEPRecepcionado,
            tableGMSSTPARecepcionado,
            tableSSSTPARecepcionado,
            tableTotalInversionRecepcionado
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
