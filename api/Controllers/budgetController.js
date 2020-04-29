const authorizedBudget = require('../Models/newAuthorizedBudgetModel');
const exercisedBudget = require('../Models/newExerciseBudgetModel');
const AppError = require('../Helpers/appError');
const numeral = require('numeral');
const Queue = require('bull');


// Background worker
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const authQueue = new Queue('Authorized', REDIS_URL);
const exerQueue = new Queue('Exercised', REDIS_URL);

exports.getAll = async (req, res, next) => {
    var e_AA = [];
    var e_CGDUOS = [];
    var e_GMDE = [];
    var e_GMGE = [];
    var e_GMM = [];
    var e_GMOPI = [];
    var e_CSTPIP = [];
    var e_GSMCCIT = [];
    var e_GSSLT = [];
    var e_GMSSTPA = [];
    var a_AA = [];
    var a_CGDUOS = [];
    var a_GMDE = [];
    var a_GMGE = [];
    var a_GMM = [];
    var a_GMOPI = [];
    var a_CSTPIP = [];
    var a_GSMCCIT = [];
    var a_GSSLT = [];
    var a_GMSSTPA = [];
    const startDate = new Date(req.query.startDate+ 'GMT-0600');
    const endDate = new Date(req.query.endDate+ 'GMT-0600');
    var name = req.query.name;
    var startMonth = startDate.getMonth()+1;
    var endMonth = endDate.getMonth()+1;
    var monthDiff = endMonth - startMonth;
    try {
        if (!startDate || !endDate) {
            return next(new AppError(400, 'Bad Request', 'Parameters are not present'));
        }
        if (endDate - startDate < 0 ) {
            return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
        }
        else if (endDate - startDate >= 0) {
            {
                var document = [];
                var manyExercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
                // This is the number of months being retreive.
                var manyExerciseLength = manyExercise.length;
                if (manyExerciseLength === 0){
                    return next(new AppError(404, 'Not found', 'There isn\'t data from the selected period'));
                }
                manyExercise.forEach((element, i) => {
                    document[i] = Object.values(element._doc);
                });
                // The first item is month, second it's the column inside the Excel file and third is the row.
                for (var i = 0; i<=manyExerciseLength-1; i++){
                    e_AA[i] = 0;
                    e_CGDUOS[i] = 0;
                    e_GMDE[i] = 0;
                    e_GMGE[i] = 0;
                    e_GMM[i] = 0;
                    e_GMOPI[i] = 0;
                    e_CSTPIP[i] = 0;
                    e_GSMCCIT[i] = 0;
                    e_GSSLT[i] = 0;
                    e_GMSSTPA[i] = 0;
                    var rowLength = document[i][0].length;
                    for (var j = 0; j<=rowLength-1; j++){
                        switch (document[i][0][j]) {
                            case 'AA':
                                e_AA[i] = e_AA[i] + document[i][2][j];
                                break;
                            case 'CGDUOS':
                                e_CGDUOS[i] = e_CGDUOS[i] + document[i][2][j];
                                break;
                            case 'GMDE':
                                e_GMDE[i] = e_GMDE[i] + document[i][2][j];
                                break;
                            case 'GMGE':
                                e_GMGE[i] = e_GMGE[i] + document[i][2][j];
                                break;
                            case 'GMM':
                                e_GMM[i] = e_GMM[i] + document[i][2][j];
                                break;
                            case 'GMOPI':
                                e_GMOPI[i] = e_GMOPI[i] + document[i][2][j];
                                break;
                            case 'CSTPIP':
                                e_CSTPIP[i] = e_CSTPIP[i] + document[i][2][j];
                                break;
                            case 'GSMCCIT':
                                e_GSMCCIT[i] = e_GSMCCIT[i] + document[i][2][j];
                                break;
                            case 'GSSLT':
                                e_GSSLT[i] = e_GSSLT[i] + document[i][2][j];
                                break;
                            case 'GMSSTPA':
                                e_GMSSTPA[i] = e_GSSLT[i] + document[i][2][j];
                                break;
                        }
                    }
                }
                var e_AATotal = e_AA.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_CGDOSTotal = e_CGDUOS.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GMDETotal = e_GMDE.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GMGETotal = e_GMGE.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GMMTotal = e_GMM.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GMOPITotal = e_GMOPI.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_CSTPIPTotal = e_CSTPIP.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GSMCCITTotal = e_GSMCCIT.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GSSLTTotal = e_GSSLT.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var e_GMSSTPATotal = e_GMSSTPA.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });

                for (k=0; k<=monthDiff; k++){
                    a_AA[k] = 0;
                    a_CGDUOS[k] = 0;
                    a_GMDE[k] = 0;
                    a_GMGE[k] = 0;
                    a_GMM[k] = 0;
                    a_GMOPI[k] = 0;
                    a_CSTPIP[k] = 0;
                    a_GSMCCIT[k] = 0;
                    a_GSSLT[k] = 0;
                    a_GMSSTPA[k] = 0;
                }
                var auth = await authorizedBudget.findOne({authorizedName: name});
                var document2;
                document2 = Object.values(auth._doc);
                var rowLength2 = document2[0].length;
                for (var j2 = 0; j2<=rowLength2-1; j2++){
                    for (var i2=0; i2<=monthDiff; i2++){
                        switch (document2[1][j2]) {
                            case 'AA':
                                a_AA[i2] = a_AA[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'CGDUOS':
                                a_CGDUOS[i2] = a_CGDUOS[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GMDE':
                                a_GMDE[i2] = a_GMDE[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GMGE':
                                a_GMGE[i2] = a_GMGE[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GMM':
                                a_GMM[i2] = a_GMM[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GMOPI':
                                a_GMOPI[i2] = a_GMOPI[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'CSTPIP':
                                a_CSTPIP[i2] = a_CSTPIP[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GSMCCIT':
                                a_GSMCCIT[i2] = a_GSMCCIT[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GSSLT':
                                a_GSSLT[i2] = a_GSSLT[i2] + document2[8+i2+startMonth][j2];
                                break;
                            case 'GMSSTPA':
                                a_GMSSTPA[i2] = GMSSTPA[i2] + document2[8+i2+startMonth][j2];
                                break;
                        }
                    }

                }
                var a_AATotal = a_AA.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_CGDOSTotal = a_CGDUOS.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GMDETotal = a_GMDE.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GMGETotal = a_GMGE.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GMMTotal = a_GMM.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GMOPITotal = a_GMOPI.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_CSTPIPTotal = a_CSTPIP.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GSMCCITTotal = a_GSMCCIT.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GSSLTTotal = a_GSSLT.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var a_GMSSTPATotal = a_GMSSTPA.reduce((valorAnterior, valorActual, indice, vector) => {
                    return valorAnterior + valorActual; });
                var avanceAA = e_AATotal / a_AATotal;
                var avanceCGDUOS = e_CGDOSTotal / a_CGDOSTotal;
                var avanceGMDE = e_GMDETotal / a_GMDETotal;
                var avanceGMGE = e_GMGETotal / a_GMGETotal;
                var avanceGMM = e_GMMTotal / a_GMMTotal;
                var avanceGMOPI = e_GMOPITotal / a_GMOPITotal;
                var avanceCSTPIP = e_CSTPIPTotal / a_CSTPIPTotal;
                var avanceGSMCCIT = e_GSMCCITTotal / a_GSMCCITTotal;
                var avanceGSSLT = e_GSSLTTotal / a_GSSLTTotal;
                var avanceGMSSTPA = e_GMSSTPATotal / a_GMSSTPATotal;
                res.status(200).json({
                    status: 'Success',
                    data: [
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'AA',
                            'Autorizado': numeral(a_AATotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_AATotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_AATotal - a_AATotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceAA ? avanceAA : 0).format('0%'),
                            'Recepcionado': numeral(628514.87).format('0.0'),
                            'EjercicioEsperado': numeral(628514.87 + e_AATotal).format('0.0'),
                            'DesviacionEsperado': numeral((628514.87 + e_AATotal) - a_AATotal).format('0.0')
                        },
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'CGDUOS',
                            'Autorizado': numeral(a_CGDOSTotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_CGDOSTotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_CGDOSTotal - a_CGDOSTotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceCGDUOS ? avanceCGDUOS : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_CGDOSTotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_CGDOSTotal) - a_CGDOSTotal).format('0.0')
                        },
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'GMDE',
                            'Autorizado': numeral(a_GMDETotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GMDETotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GMDETotal - a_GMDETotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGMDE ? avanceGMDE : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_GMDETotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GMDETotal) - a_GMDETotal).format('0.0')
                        },
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'GMGE',
                            'Autorizado': numeral(a_GMGETotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GMGETotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GMGETotal - a_GMGETotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGMGE ? avanceGMGE : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_GMGETotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GMGETotal) - a_GMGETotal).format('0.0')
                        },
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'GMM',
                            'Autorizado': numeral(a_GMMTotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GMMTotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GMMTotal - a_GMMTotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGMM ? avanceGMM : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_GMMTotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GMMTotal) - a_GMMTotal).format('0.0')
                        },
                        {
                            'Subdirección':'SPRN APV',
                            'GM': 'GMOPI',
                            'Autorizado': numeral(a_GMOPITotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GMOPITotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GMOPITotal - a_GMOPITotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGMOPI ? avanceGMOPI : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_GMOPITotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GMOPITotal) - a_GMOPITotal).format('0.0')
                        },
                        {
                            'Subdirección':'SASEP',
                            'GM': 'CSTPIP',
                            'Autorizado': numeral(a_CSTPIPTotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_CSTPIPTotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_CSTPIPTotal - a_CSTPIPTotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceCSTPIP ? avanceCSTPIP : 0).format('0%'),
                            'Recepcionado': numeral(4856105.47).format('0.0'),
                            'EjercicioEsperado': numeral(4856105.47 + e_CSTPIPTotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_CSTPIPTotal) - a_CSTPIPTotal).format('0.0')
                        },
                        {
                            'Subdirección':'SASEP',
                            'GM': 'GSMCCIT',
                            'Autorizado': numeral(a_GSMCCITTotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GSMCCITTotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GSMCCITTotal - a_GSMCCITTotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGSMCCIT ? avanceGSMCCIT : 0).format('0%'),
                            'Recepcionado': numeral(200551.76).format('0.0'),
                            'EjercicioEsperado': numeral(200551.76 + e_GSMCCITTotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GSMCCITTotal) - a_GSMCCITTotal).format('0.0')
                        },
                        {
                            'Subdirección':'SASEP',
                            'GM': 'GSSLT',
                            'Autorizado': numeral(a_GSSLTTotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GSSLTTotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GSSLTTotal - a_GSSLTTotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGSSLT ? avanceGSSLT : 0).format('0%'),
                            'Recepcionado': numeral(5238334.59).format('0.0'),
                            'EjercicioEsperado': numeral(5238334.59 + e_GSSLTTotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GSSLTTotal) - a_GSSLTTotal).format('0.0')
                        },
                        {
                            'Subdirección':'SSSTPA',
                            'GM': 'GMSSTPA',
                            'Autorizado': numeral(a_GMSSTPATotal).divide(1000000).format('0.0'),
                            'Ejercicio': numeral(e_GMSSTPATotal).divide(1000000).format('0.0'),
                            'Desviación': numeral(e_GMSSTPATotal - a_GMSSTPATotal).divide(1000000).format('0.0'),
                            'Avance': numeral(avanceGMSSTPA ? avanceGMSSTPA : 0).format('0%'),
                            'Recepcionado': numeral(0).format('0.0'),
                            'EjercicioEsperado': numeral(0 + e_GMSSTPATotal).format('0.0'),
                            'DesviacionEsperado':  numeral((0 + e_GMSSTPATotal) - a_GMSSTPATotal).format('0.0')
                        }
                    ],

                });

            }
        }

    } catch (err) {
        console.log(err);
        next(err);
    }
};


exports.postAuthorized = async (req, res, next) => {
    if (!req.file || !req.body.sheetName || !req.body.authNumber){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var sheetName = req.body.sheetName;
    var filepath = './' + req.file.path;
    var user = req.user;
    var authNumber = req.body.authNumber;
    var job;
    job = await authQueue.add({filepath, sheetName, user, authNumber});
    res.status(202).json({
        status: 'Accepted',
        data: {
            id: job.id
        },
        'message': 'The job is being process. It will be update in a few minutes'
    });
};

exports.postExercised = async (req, res, next) => {
    if (!req.file || !req.body.sheetName || !req.body.inputDate){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var inputDate = new Date(req.body.inputDate + 'GMT-0600');
    var inputYear = inputDate.getFullYear();
    var inputMonth = inputDate.getMonth()+1;
    var sheetName = req.body.sheetName;
    var filepath =  req.file.path;
    var user = req.user;
    var job;
    job = await exerQueue.add({filepath, sheetName, user, inputDate, inputYear, inputMonth});
    res.status(202).json({
        status: 'Accepted',
        data: {
            id: job.id
        },
        'message': 'The job is being process. It will be update in a few minutes'
    });
};

exports.getJobs = async (req, res, next) => {
    let id = req.params.id;
    let job = await exerQueue.getJob(id);

    if (job === null) {
        res.status(404).end();
    } else {
        let state = await job.getState();
        let progress = job._progress;
        let reason = job.failedReason;
        res.json({ id, state, progress, reason });
    }};
