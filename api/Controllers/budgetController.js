const authorizedBudget = require('../Models/authorizedBudgetModel');
const exercisedBudget = require('../Models/exerciseBudgetModel');
const receivedBudget = require('../Models/receivedBudgetModel');
const AppError = require('../Helpers/appError');
const numeral = require('../Helpers/numeral');
const Excel = require('exceljs');
const sorter = require('../Helpers/sortExercise');
const HojaCopade = require('../Models/HojaCopadeModel');
const exerciseChart = require('../Models/exerciseChartModel');
const copadeBudget = require('../Models/CopadeBugdetModel');
const moment = require('moment-timezone');

// Regresa el autorizado, ejercicio y pedidos con recepción para llenar la tabla.
exports.getBudget = async (req, res, next) => {
    if (!req.query.startDate || !req.query.endDate || !req.query.authName) {
        // Si no existen los campos necesarios, envía un error 400.
        return next(new AppError(400, 'Bad Request', 'No hay suficientes parámetros o son inválidos.'));
    }
    // La fecha de incio del ejercicio y autorizado en zona horarioa GMT-6
    const startDate = new Date(req.query.startDate+ 'GMT-0600');
    // La fecha de final del ejercicio y autorizado en zona horarioa GMT-6
    const endDate = new Date(req.query.endDate+ 'GMT-0600');
    // Sobre que autorizado se va a comparar
    const authName = req.query.authName;
    // El mes de inicio, enero es 0.
    var startMonth = startDate.getMonth();
    // El mes de fin, enero es 0.
    var endMonth = endDate.getMonth();
    // Los meses totales.
    var monthDiff = endMonth - startMonth;
    // Si la fecha inicial es antes que la fecha de final, enviar un error 400.
    if (endDate - startDate < 0 ) {
        return next(new AppError(400, 'Bad Request', 'La fecha de inicio debe ser antes que la fecha de fin.'));
    }
    // Variables de ejercicio por GM
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
    // Variables de autorizado por GM
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
    // Bloque Try - Catch
    try {
        // Busca en la base de datos los ejercicos entre las fechas de incio y fin.
        var exercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
        // Si no hay ejercicios, regresa un error 404.
        if (exercise.length === 0){
            return next(new AppError(404, 'Not found', 'No hay información del periodo seleccionado.'));
        }
        // Sumar todos los ejercicios por GM
        for (let i = 0; i < exercise.length; i++) {
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
        // Busca en la base de datos el autorizado que se requiere.
        var authorized = await authorizedBudget.findOne({authName});
        if (authorized === null || authorized.length === 0){
            return next(new AppError(404, 'Not found', `No hay información de ${authName}`));
        }
        // Sumar el autorizado de los meses que se solicitan
        for (let j = startMonth; j <= startMonth + monthDiff; j++) {
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
        // TODO: Fix this mess.
        // Obtiene la fecha del último ejercicio subido y lo simplifica a AAAA-MM-DD.
        // Buscar en la base de datos el documento de pedidos con recepción del mismo día que el último ejercicio.
        var received = await receivedBudget.findOne().sort({receivedDate: -1});
        // El avance de cada GM, se divide el ejercicio entre el autorizado.
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
        // El avance esperado de cada GM, se divide el ejercicio + los pedidios con recepción entre el autorizado.
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
        // El autorizado, ejercicio, avance, avance esperado y recepcionado total para cada SPRN APV.
        var a_SPRN = a_AA + a_CGDUOS + a_GMDE + a_GMGE + a_GMM + a_GMOPI;
        var e_SPRN = e_AA + e_CGDUOS + e_GMDE + e_GMGE + e_GMM + e_GMOPI;
        var avanceSPRN = e_SPRN / a_SPRN;
        var recepcionadoSPRN = received.AA + received.CGDUOS + received.GMDE + received.GMGE + received.GMM + received.GMOPI;
        var avanceEsperadoSPRN = (recepcionadoSPRN + e_SPRN) / a_SPRN;
        // El autorizado, ejercicio, avance, avance esperado y recepcionado total para cada SASEP.
        var a_SASEP = a_CSTPIP + a_GSMCCIT + a_GSSLT;
        var e_SASEP = e_CSTPIP + e_GSMCCIT + e_GSSLT;
        var avanceSASEP = e_SASEP / a_SASEP;
        var recepcionadoSASEP = received.CSTPIP + received.GSMCCIT + received.GSSLT;
        var avanceEsperadoSASEP = (recepcionadoSASEP + e_SASEP) / a_SASEP;
        // El autorizado, ejercicio, avance, avance esperado y recepcionado total para cada SSSTPA.
        var a_SSSTPA = a_GMSSTPA;
        var e_SSSTPA = e_GMSSTPA;
        var avanceSSSTPA = e_SSSTPA / a_SSSTPA;
        var recepcionadoSSSTPA = received.GMSSTPA;
        var avanceEsperadoSSSTPA = (recepcionadoSSSTPA + e_SSSTPA) / a_SSSTPA;
        // El autorizado, ejercicio, avance, avance esperado y recepcionado total.
        var a_Total = a_SPRN + a_SASEP + a_SSSTPA;
        var e_Total = e_SPRN + e_SASEP + e_SSSTPA;
        var avanceTotal = e_Total / a_Total;
        var recepcionadoTotal = recepcionadoSPRN + recepcionadoSASEP + recepcionadoSSSTPA;
        var avanceEsperadoTotal = (recepcionadoTotal + e_Total) / a_Total;
        // Last Update
        var lastUpdateDate = exercise[exercise.length-1].createdAt;
        var lastUpdateMonth = lastUpdateDate.getMonth();
        switch (lastUpdateMonth) {
            case 0:
                lastUpdateMonth = 'enero';
                break;
            case 1:
                lastUpdateMonth = 'febrero';
                break;
            case 2:
                lastUpdateMonth = 'marzo';
                break;
            case 3:
                lastUpdateMonth = 'abril';
                break;
            case 4:
                lastUpdateMonth = 'mayo';
                break;
            case 5:
                lastUpdateMonth = 'junio';
                break;
            case 6:
                lastUpdateMonth = 'julio';
                break;
            case 7:
                lastUpdateMonth = 'agosto';
                break;
            case 8:
                lastUpdateMonth = 'septiembre';
                break;
            case 9:
                lastUpdateMonth = 'octubre';
                break;
            case 10:
                lastUpdateMonth = 'noviembre';
                break;
            case 11:
                lastUpdateMonth = 'diciembre';
                break;
        }
        var lastUpdate = `${lastUpdateDate.getDate()} de ${lastUpdateMonth} de ${lastUpdateDate.getFullYear()}`;
        // Se envía la respuesta al cliente.
        res.status(200).json({
            status: 'Success',
            lastUpdate,
            data: [
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'AA',
                    'Autorizado': numeral(a_AA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_AA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_AA - a_AA).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceAA ? avanceAA : 0).format('0%'),
                    'Recepcionado': numeral(received.AA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.AA + e_AA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.AA + e_AA) - a_AA).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoAA) ? avanceEsperadoAA : 0).format('0%'),
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'CGDUOS',
                    'Autorizado': numeral(a_CGDUOS).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_CGDUOS).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_CGDUOS - a_CGDUOS).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceCGDUOS ? avanceCGDUOS : 0).format('0%'),
                    'Recepcionado': numeral(received.CGDUOS).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.CGDUOS + e_CGDUOS).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.CGDUOS + e_CGDUOS) - a_CGDUOS).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoCGDUOS) ? avanceEsperadoCGDUOS : 0).format('0%'),
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMDE',
                    'Autorizado': numeral(a_GMDE).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMDE).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMDE - a_GMDE).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGMDE ? avanceGMDE : 0).format('0%'),
                    'Recepcionado': numeral(received.GMDE).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMDE + e_GMDE).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMDE + e_GMDE) - a_GMDE).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMDE) ? avanceEsperadoGMDE : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMGE',
                    'Autorizado': numeral(a_GMGE).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMGE).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMGE - a_GMGE).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGMGE ? avanceGMGE : 0).format('0%'),
                    'Recepcionado': numeral(received.GMGE).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMGE + e_GMGE).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMGE + e_GMGE) - a_GMGE).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMGE) ? avanceEsperadoGMGE : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMM',
                    'Autorizado': numeral(a_GMM).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMM).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMM - a_GMM).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGMM ? avanceGMM : 0).format('0%'),
                    'Recepcionado': numeral(received.GMM).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMM + e_GMM).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMM + e_GMM) - a_GMM).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMM) ? avanceEsperadoGMM : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'GMOPI',
                    'Autorizado': numeral(a_GMOPI).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMOPI).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMOPI - a_GMOPI).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGMOPI ? avanceGMOPI : 0).format('0%'),
                    'Recepcionado': numeral(received.GMOPI).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMOPI + e_GMOPI).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMOPI + e_GMOPI) - a_GMOPI).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMOPI) ? avanceEsperadoGMOPI : 0).format('0%')
                },
                {
                    'Subdirección':'SPRN APV',
                    'GM': 'SPRN APV',
                    'Autorizado': numeral(a_SPRN).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SPRN).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SPRN - a_SPRN).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceSPRN ? avanceSPRN : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSPRN).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSPRN + e_SPRN).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSPRN + e_SPRN) - a_SPRN).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSPRN) ? avanceEsperadoSPRN : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'CSTPIP',
                    'Autorizado': numeral(a_CSTPIP).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_CSTPIP).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_CSTPIP - a_CSTPIP).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceCSTPIP ? avanceCSTPIP : 0).format('0%'),
                    'Recepcionado': numeral(received.CSTPIP).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.CSTPIP + e_CSTPIP).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.CSTPIP + e_CSTPIP) - a_CSTPIP).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoCSTPIP) ? avanceEsperadoCSTPIP : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'GSMCCIT',
                    'Autorizado': numeral(a_GSMCCIT).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GSMCCIT).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GSMCCIT - a_GSMCCIT).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGSMCCIT ? avanceGSMCCIT : 0).format('0%'),
                    'Recepcionado': numeral(received.GSMCCIT).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GSMCCIT + e_GSMCCIT).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GSMCCIT + e_GSMCCIT) - a_GSMCCIT).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGSMCCIT) ? avanceEsperadoGSMCCIT : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'GSSLT',
                    'Autorizado': numeral(a_GSSLT).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GSSLT).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GSSLT - a_GSSLT).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGSSLT ? avanceGSSLT : 0).format('0%'),
                    'Recepcionado': numeral(received.GSSLT).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GSSLT + e_GSSLT).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GSSLT + e_GSSLT) - a_GSSLT).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGSSLT) ? avanceEsperadoGSSLT : 0).format('0%')
                },
                {
                    'Subdirección':'SASEP',
                    'GM': 'SASEP',
                    'Autorizado': numeral(a_SASEP).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SASEP).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SASEP - a_SASEP).divide(1000000).format('0.0'),
                    'Avance': numeral(avanceSASEP ? avanceSASEP : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSASEP).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSASEP + e_SASEP).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSASEP + e_SASEP) - a_SASEP).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSASEP) ? avanceEsperadoSASEP : 0).format('0%')
                },
                {
                    'Subdirección':'SSSTPA',
                    'GM': 'GMSSTPA',
                    'Autorizado': numeral(a_GMSSTPA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_GMSSTPA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_GMSSTPA - a_GMSSTPA).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceGMSSTPA ? avanceGMSSTPA : 0).format('0%'),
                    'Recepcionado': numeral(received.GMSSTPA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(received.GMSSTPA + e_GMSSTPA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((received.GMSSTPA + e_GMSSTPA) - a_GMSSTPA).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoGMSSTPA) ? avanceEsperadoGMSSTPA : 0).format('0%')
                },
                {
                    'Subdirección':'SSSTPA',
                    'GM': 'SSSTPA',
                    'Autorizado': numeral(a_SSSTPA).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_SSSTPA).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_SSSTPA - a_SSSTPA).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceSSSTPA ? avanceSSSTPA : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoSSSTPA).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoSSSTPA + e_SSSTPA).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoSSSTPA + e_SSSTPA) - a_SSSTPA).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoSSSTPA) ? avanceEsperadoSSSTPA : 0).format('0%')
                },
                {
                    'Subdirección':'Total Inversión',
                    'GM': 'TOTAL',
                    'Autorizado': numeral(a_Total).divide(1000000).format('0.0'),
                    'Ejercicio': numeral(e_Total).divide(1000000).format('0.0'),
                    'Desviación': numeral(e_Total - a_Total).divide(1000000).format('0.0'),
                    // Si el avance se divide entre 0, utiliza 9, si no, utiliza avance.
                    'Avance': numeral(avanceTotal ? avanceTotal : 0).format('0%'),
                    'Recepcionado': numeral(recepcionadoTotal).divide(1000000).format('0.0'),
                    'EjercicioEsperado': numeral(recepcionadoTotal + e_Total).divide(1000000).format('0.0'),
                    'DesviacionEsperado': numeral((recepcionadoTotal + e_Total) - a_Total).divide(1000000).format('0.0'),
                    // Si el avanceEsperado se divide entre 0, utiliza 0, si no, utiliza el avanceEsperado
                    'AvanceEsperado': numeral(isFinite(avanceEsperadoTotal) ? avanceEsperadoTotal : 0).format('0%')
                },
            ],

        });
    } catch (err) {
        // Si hay algún error, logealo y envíalo al siguiente middleware.
        console.log(err);
        next(err);
    }
};
// Regresa los datos de la gráfica
exports.getChart = async (req,res,next) => {
    try {
        var dias = [];
        var totalEjercicio = [];
        var exerciseChartRes = await exerciseChart.find();
        for (let i = 0; i < exerciseChartRes.length; i++) {
            dias.push(exerciseChartRes[i].exerciseDate.toISOString().split('T')[0]);
            totalEjercicio.push(numeral(exerciseChartRes[i].exerciseTotal).divide(1000000).format('0.0'));
        }
        res.status(200).json({
            status: 'Success',
            data: {
                dias,
                totalEjercicio
            }
        });
    } catch (err) {
        next(err);
        console.log(err);
    }
};
// Crea un documento de presupuesto autorizado con los datos de un archivo de Excel.
// TODO: Make a simplified version of this. Without Excel reader.
exports.postAuthorized = async (req, res, next) => {
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.file || !req.body.sheetName || !req.body.authName){
        return next(new AppError(400, 'Bad Request', 'No están presentes los archivos o parámetros '));
    }
    // Variables de la petición.
    var sheetName = req.body.sheetName;
    var filepath = './' + req.file.path;
    var user = req.user;
    var authName = req.body.authName;
    // Variables para almacenar los autorizados por mes.
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
    // For loop para inicializar el arreglo con 0s.
    for (let i=0; i <= 11; i++) {
        AA[i]      = 0;
        CGDUOS[i]  = 0;
        GMDE[i]    = 0;
        GMGE[i]    = 0;
        GMM[i]     = 0;
        GMOPI[i]   = 0;
        CSTPIP[i]  = 0;
        GSMCCIT[i] = 0;
        GSSLT[i]   = 0;
        GMSSTPA[i] = 0;
    }
    // Bloque Try - Catch
    try {
        // Crear un nuevo hoja de trabajo en Excel.
        var workbook = new Excel.Workbook();
        // Leer el archivo subido
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            // Abrir la hoja declarada en la petición
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row, rowNumber) => {
                if(rowNumber !== 1){
                    row.eachCell((cell) => {
                        inputRow.push(cell.value);
                    });
                    // Clasificación según su GM.
                    switch (inputRow[1]) {
                        case 'AA':
                            for (let i=0; i<=11; i++){
                                AA[i] = AA[i] + inputRow[9+i];
                            }
                            break;
                        case 'CGDUOS':
                            for (let i=0; i<=11; i++){
                                CGDUOS[i] = CGDUOS[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMDE':
                            for (let i=0; i<=11; i++){
                                GMDE[i] = GMDE[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMGE':
                            for (let i=0; i<=11; i++){
                                GMGE[i] = GMGE[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMM':
                            for (let i=0; i<=11; i++){
                                GMM[i] = GMM[i] + inputRow[9+i];
                            }
                            break;
                        case 'GMOPI':
                            for (let i=0; i<=11; i++){
                                GMOPI[i] = GMOPI[i] + inputRow[9+i];
                            }
                            break;
                        case 'CSTPIP':
                            for (let i=0; i<=11; i++){
                                CSTPIP[i] = CSTPIP[i] + inputRow[9+i];
                            }
                            break;
                        case 'GSMCCIT':
                            for (let i=0; i<=11; i++){
                                GSMCCIT[i] = GSMCCIT[i] + inputRow[9+i];
                            }
                            break;
                        case 'GSSLT':
                            for (let i=0; i<=11; i++){
                                GSSLT[i] = GSSLT[i] + inputRow[9+i];
                            }
                            break;
                        case 'SSSTPA':
                            for (let i=0; i<=11; i++){
                                GMSSTPA[i] = GMSSTPA[i] + inputRow[9+i];
                            }
                            break;
                    }
                }
                // Vaciar la fila de entrada
                inputRow = [];
            });
            // Guardar el autorizado en la base de datos.
            var autorizado = await authorizedBudget.create({createdBy: user, createdAt: Date.now(),
                authName, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            // Se envía la respuesta al cliente.
            res.status(201).json({
                status: 'Created',
                data: {
                    autorizado
                }
            });
        }).catch( (err) => {
            // Si hay algún error leyendo el archivo de excel, logealo y envíalo como respuesta.
            console.log(err);
            return next(new AppError(500, 'Server error', err.message));
        });
    } catch (err) {
        // Si hay algún error, logealo y envíalo al siguiente middleware.
        console.log(err);
        next(err);
    }
};
exports.postAuthorizedSimple = async (req, res, next) => {
    try {
        if (!req.body.a_AA || !req.body.a_CGDUOS || !req.body.a_GMDE || !req.body.a_GMGE || !req.body.a_GMM
            || !req.body.a_GMOPI || !req.body.a_CSTPIP || !req.body.a_GSMCCIT|| !req.body.a_GSSLT
            || !req.body.a_GMSSTPA || !req.body.authName){
            return next(new AppError(400, 'Bad Request', 'No están presentes los archivos o parámetros '));
        }
        var AA = req.body.a_AA;
        var CGDUOS = req.body.a_CGDUOS;
        var GMDE = req.body.a_GMDE;
        var GMGE = req.body.a_GMGE;
        var GMM = req.body.a_GMM;
        var GMOPI = req.body.a_GMOPI;
        var CSTPIP = req.body.a_CSTPIP;
        var GSMCCIT = req.body.a_GSMCCIT;
        var GSSLT = req.body.a_GSSLT;
        var GMSSTPA = req.body.a_GMSSTPA;
        var authName = req.body.authName;
        var user = req.user;
        var autorizado = await authorizedBudget.create({createdBy: user, createdAt: Date.now(),
            authName, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
        // Se envía la respuesta al cliente.
        res.status(201).json({
            status: 'Created',
            data: {
                autorizado
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};
// Crea un documento de presupuesto ejercido con los datos de un archivo de Excel.
exports.postExercised = async (req, res, next) => {
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.file || !req.body.sheetName || !req.body.inputDate || !req.body.addtoChart){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    // Variables de la petición
    var inputDate = new Date(req.body.inputDate + 'GMT-0600');
    var sheetName = req.body.sheetName;
    var filepath =  './' + req.file.path;
    var addtoChart = req.body.addtoChart;
    var user = req.user;
    // Variables para almacenar el ejercicio por GM.
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
    // Variables con los números de la columnas en Excel que tienen el valor requerido.
    const colCentroGestor = 6;
    const colPosicionFinanciera = 7;
    const colPosicionPresupuestal = 8;
    const colContrato = 14;
    const colImporte = 23;
    var inputRow = [];
    // Variable para almacenar el total ejercido.
    var total = 0;
    // Bloque Try - Catch
    try {
        // Crear un nuevo hoja de trabajo en Excel.
        var workbook = new Excel.Workbook();
        // Leer el archivo subido
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            // Abrirl la hoja declarada en la petición.
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row,rowNumber) => {
                // No hacer nada en la primera fila.
                if (rowNumber !== 1) {
                    row.eachCell((cell) => {
                        // Guardar todos los valores de la fila en un Array
                        inputRow.push(cell.value);
                    });
                    // Enviar array a clasificación y traerlo de vuelta clasificado.
                    var outputRow = sorter.sort(inputRow,colCentroGestor,colPosicionFinanciera,
                        colPosicionPresupuestal,colContrato,colImporte);
                    // Agrupar por GM
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
                // Vaciar array
                inputRow = [];
            });
            // Checar si ya existe un ejercicio para ese mes, si hay, lo elimina.
            await exercisedBudget.findOneAndDelete({exerciseDate: inputDate });
            // Guardar el ejercicio en la base de datos.
            var exercise = await exercisedBudget.create({createdBy: user, createdAt: Date.now(),
                exerciseDate: inputDate, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            // Obtener todos los ejercicios guardados, del último al primero.
            var todosEjercicios = await exercisedBudget.find().sort({exerciseDate: -1});
            for (let i = 0; i < todosEjercicios.length; i++) {
                total = total + todosEjercicios[i].AA + todosEjercicios[i].CGDUOS + todosEjercicios[i].GMDE +
                todosEjercicios[i].GMGE + todosEjercicios[i].GMM + todosEjercicios[i].GMOPI + todosEjercicios[i].CSTPIP
                + todosEjercicios[i].GSMCCIT + todosEjercicios[i].GSSLT + todosEjercicios[i].GMSSTPA;
            }
            // Si la opción es selecionada, crea un nuevo documento para el gráfico del ejercicio, lo que hace es sumar el nuevo ejercicio total y guardarlo.
            if (String(addtoChart) == 'true') { await exerciseChart.create({createdBy: user, createdAt: moment().tz('America/Mexico_City').format(), exerciseDate: moment().tz('America/Mexico_City').format(), exerciseTotal:total}); }
            // Envía la respuesta al cliente
            res.status(201).json({
                status: 'Created',
                data: {
                    exercise,
                }
            });
        }).catch((err) => {
            // Si hay algún error leyendo el archivo de Excel, se maneja aquí.
            return next(new AppError(500, 'Server error', err.message));
        });
    }
    catch (err) {
        // De existir, envía el error al siguiente middleware.
        next(err);
    }
};
// Obtiene todos los ejercicios
exports.getExercised = async (req, res, next) => {
    try {
        var exercise = await exercisedBudget.find().sort({'exerciseDate': -1}).limit(10);
        res.status(200).json({
            status: 'Success',
            data: {
                exercise
            }
        });
    } catch (e) {
        next (e);
        console.log(e);
    }
};
// Elimina un ejercicio
exports.deleteExercised = async (req,res, next) => {
    try {
        var id = req.params.id;
        var deleted = await exercisedBudget.findByIdAndDelete(id);
        res.status(200).json({
            status: 'Deleted',
            data: {
                exercise: deleted
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

// Crea un documento de los COPADEs con los datos de un archivo de Excel.
exports.postCopades = async (req, res, next) => {
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.file || !req.body.sheetName || !req.body.copadeDate){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    // Variables de la petición
    var sheetName = req.body.sheetName;
    var copadeDate = new Date(req.body.copadeDate+ 'GMT-0600');
    var filepath =  './' + req.file.path;
    var user = req.user;
    // Array para almacenar la llave los pedidos que tienen COPADE
    var copadeArray = [];
    // Bloque Try - Catch.
    try {
        // Crea un nuevo libro de trabajo de Excel.
        var workbook = new Excel.Workbook(); +
        // Leer el archivo subido en la petición
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            // Abrirl la hoja declarada en la petición.
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row,rowNumber) => {
                // No hacer nada en la primera fila
                if (rowNumber !== 1){
                    // Si tiene algún valor en la columna 9, concatena el pedido y la posición y guárdalo.
                    if (row.values[9]) {
                        var pedido = row.values[6];
                        var posicion = row.values[5];
                        var llave = pedido.concat(posicion);
                        copadeArray.push(llave);
                    }
                }
            });
            // Guardar los copades en la base de datos.
            var copades = await copadeBudget.create({createdBy: user, createdAt: Date.now(),
                COPADEs: copadeArray, CopadeDate: copadeDate});
            // Enviar la respuesta al cliente.
            res.status(201).json({
                status: 'Created',
                copades
            });
        })
        .catch ( (err)  => {
            // Manejo de errores al leer el archivo de Excel.
            console.log(err);
            return next(new AppError(500, 'Server error', err.message));
        });

    }
    catch (err) {
        // Manejo de errores.
        console.log(err);
        next(err);
    }
};

exports.getCopades = async (req, res, next) => {
    try {
        var copades = await copadeBudget.find().sort({'CopadeDate': -1}).limit(10);
        for (let i = 0; i < copades.length; i++){
            copades[i].COPADEs = undefined;
        }
        res.status(200).json({
            status: 'Success',
            data: {
                copades
            }
        });
    } catch (e) {
        next (e);
        console.log(e);
    }
};

exports.deleteCopades = async (req, res, next) => {
    try {
        var id = req.params.id;
        var deleted = await copadeBudget.findByIdAndDelete(id);
        res.status(200).json({
            status: 'Deleted',
            data: {
                exercise: deleted
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};
// Crea un documento de los pedidos con recepción con los datos de un archivo de Excel.
exports.postReceived = async (req, res, next) => {
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.file || !req.body.sheetName || !req.body.receivedDate){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    // Variables de la petición
    var sheetName = req.body.sheetName;
    var receivedDate = new Date(req.body.receivedDate + 'GMT-0600');
    var filepath =  './' + req.file.path;
    var user = req.user;
    // Variables para almacenar los pedidos con recepción por GM.
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
    // Variables para almacenar el pedido, la posición y las llaves para distinguir entre COPADE y hoja de Entrada.
    var pedido;
    var posicion;
    var llave;
    // Variables para almacenar las hoja de entrada y COPADE.
    var COPADETable = [];
    var HojadeEntradaTable = [];
    // Variables con los números de la columnas en Excel que tienen el valor requerido.
    const colCentroGestor = 8;
    const colPosicionFinanciera = 9;
    const colPosicionPresupuestal = 10;
    const colContrato = 3;
    var inputRow = [];
    try {
        // Busca en la base de datos el documento de COPADEs que tiene la misma fecha que los pedidos que se van a ingresar.
        var copade = await copadeBudget.findOne({CopadeDate: receivedDate});
        // Crea un nuevo libro de trabajo de Excel
        var workbook = new Excel.Workbook();
        // Lee el archivo subido
        workbook.xlsx.readFile(filepath)
        .then(async () => {
            // Abre la hoja solicitada en la petición.
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row,rowNumber) => {
                // Omite la primera fila
                if (rowNumber !== 1){
                    row.eachCell((cell) => {
                        inputRow.push(cell.value);
                    });
                    // Clasifica cada fila y regresa una fila clasificada
                    var outputRow = sorter.generalSort(inputRow,colCentroGestor,colPosicionFinanciera,
                        colPosicionPresupuestal,colContrato);
                    // Crea una llave de la posición y el pedido para compararla con el array de Copades
                    pedido = outputRow[2];
                    posicion = outputRow[3];
                    llave = pedido.concat(posicion);
                    // Agrupar por GM
                    switch (outputRow[0]) {
                        case 'AA':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            AA = AA + outputRow[23];
                            break;
                        case 'CGDUOS':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            CGDUOS = CGDUOS + outputRow[23];
                            break;
                        case 'GMDE':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GMDE = GMDE + outputRow[23];
                            break;
                        case 'GMGE':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GMGE = GMGE + outputRow[23];
                            break;
                        case 'GMM':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GMM = GMM + outputRow[23];
                            break;
                        case 'GMOPI':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GMOPI = GMOPI + outputRow[23];
                            break;
                        case 'CSTPIP':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            CSTPIP = CSTPIP + outputRow[23];
                            break;
                        case 'GSMCCIT':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GSMCCIT = GSMCCIT + outputRow[23];
                            break;
                        case 'GSSLT':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GSSLT = GSSLT + outputRow[23];
                            break;
                        case 'GMSSTPA':
                            // Si la llave creada se encuentra dentro del array de copades, guardala el nombre del acreedor y
                            // el importe en el Array COPADETable, de lo contrario, guardalo en el array HojadeEntradaTable.
                            if (copade.COPADEs.includes(llave)) {
                                COPADETable.push([outputRow[6], outputRow[23]]);
                            }
                            else {
                                HojadeEntradaTable.push([outputRow[6], outputRow[23]]);
                            }
                            // Suma el total por GM.
                            GMSSTPA = GMSSTPA + outputRow[23];
                            break;
                    }
                }
                inputRow = [];
            });
            // Guarda en la base de datos el Array de Hoja de entrada y el array de Copades.
            await HojaCopade.create({createdBy: user, createdAt: Date.now(),
                CopadeDate: copade.CopadeDate, COPADE: COPADETable, HojadeEntrada: HojadeEntradaTable});
            // Guarda en la base de datos un documento con el importe total de pedidos con recepción por GM.
            var received = await receivedBudget.create({createdBy: user, createdAt: Date.now(),
                receivedDate: receivedDate, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
            // Envía la respuesta al cliente.
            res.status(201).json({
                status: 'Created',
                data: {
                    received
                }
            });
        }).catch ((err) => {
            // Manejo de error al leer el archivo de Excel.
            console.log(err);
            return next(err);
        });
    } catch (err) {
        // Manejo de error
        console.log(err);
        next(err);
    }
};

exports.getReceived = async (req, res, next) => {
    try {
        var received = await receivedBudget.find().sort({'receivedDate': -1}).limit(10);
        res.status(200).json({
            status: 'Success',
            data: {
                received
            }
        });
    } catch (e) {
        next (e);
        console.log(e);
    }
};

exports.deleteReceived = async (req, res, next) => {
    try {
        var id = req.params.id;
        var deleted = await receivedBudget.findByIdAndDelete(id);
        res.status(200).json({
            status: 'Deleted',
            data: {
                exercise: deleted
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

// Crea un documento con los avances del ejercicio
exports.postExerciseChart = async (req, res, next) => {
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.body.exerciseDate || !req.body.exerciseTotal){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    // Variables de la petición
    var user = req.user;
    var exerciseDate = new Date(req.body.exerciseDate+ 'GMT-0600');
    var exerciseTotal = req.body.exerciseTotal;
    // Bloque Try - Catch
    try {
        // Crea un documento en la base de datos con los datos proporcionados en la petición
        var chart = await exerciseChart.create({createdBy: user, createdAt: Date.now(), exerciseDate, exerciseTotal});
        // Envía la respuesta al cliente
        res.status(201).json({
            status: 'Created',
            chart
        });
    }
    catch (err) {
        // Manejo de errores
        console.log(err);
        next(err);
    }
};
exports.getExerciseChart = async (req, res, next) => {
    try {
        var chart = await exerciseChart.find().sort({'exerciseDate': -1}).limit(10);
        res.status(200).json({
            status: 'Success',
            data: {
                chart
            }
        });
    } catch (e) {
        next (e);
        console.log(e);
    }
};

exports.deleteExerciseChart = async (req, res, next) => {
    try {
        var id = req.params.id;
        var deleted = await exerciseChart.findByIdAndDelete(id);
        res.status(200).json({
            status: 'Deleted',
            data: {
                exercise: deleted
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
};



