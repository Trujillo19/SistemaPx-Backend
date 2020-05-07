const authorizedBudget = require('../Models/newAuthorizedBudgetModel');
const exercisedBudget = require('../Models/newExerciseBudgetModel');
const receivedBudget = require('../Models/receivedBudgetModel');
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
