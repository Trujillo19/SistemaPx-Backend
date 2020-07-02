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
        var lastUpdateDate = exercise[exercise.length-1].exerciseDate;
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
            if (String(addtoChart) == 'true') { await exerciseChart.create({createdBy: user, createdAt: Date.now(), exerciseDate: Date.now(), exerciseTotal:total}); }
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

// Eliminar esta
exports.getPresentation = async (req, res, next) => {
    if (!req.query.startDate || !req.query.endDate || !req.query.authName){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    var mesInicial;
    var mesFinal;
    var anoSlide4 = ['Enero','Febrero','Marzo','Abril', 'Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
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
    var dias = [];
    var totalEjercicio = [];
    if (endDate - startDate < 0 ) {
        return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
    }
    try {
        var hojayCopade = await HojaCopade.findOne().sort({createdAt: -1});
        var authorized = await authorizedBudget.findOne({authName});
        var exercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
        var received = await receivedBudget.findOne().sort({receivedDate: -1});
        var exerciseChartRes = await exerciseChart.find();
        for (var k77 = 0; k77 < exerciseChartRes.length; k77++) {
            dias.push(exerciseChartRes[k77].exerciseDate.toISOString().split('T')[0]);
            totalEjercicio.push(exerciseChartRes[k77].exerciseTotal);
        }

        var ArrayEntrada = [];
        var ArrayCopade = [];
        var entradaTotal = [];
        var sumaImporteEntrada = 0;
        var sumaContadorEntrada = 0;
        var copadeTotal = [];
        var sumaImporteCopade = 0;
        var sumaContadorCopade = 0;
        for (var i = 0; i < hojayCopade.HojadeEntrada.length; i++){
            var importe = 0;
            var suma = 0;
            for (var k = i; k < hojayCopade.HojadeEntrada.length; k++) {
                if (hojayCopade.HojadeEntrada[i][0] === hojayCopade.HojadeEntrada[k][0]) {
                    importe = importe + hojayCopade.HojadeEntrada[k][1];
                    suma = suma + 1;
                    hojayCopade.HojadeEntrada[k][1] = 0;
                }
            }
            if (importe !== 0) {
                ArrayEntrada.push([hojayCopade.HojadeEntrada[i][0], importe, suma]);
            }
        }
        for (var i5 = 0; i5 < hojayCopade.COPADE.length; i5++){
            var importeCopade = 0;
            var sumaCopade = 0;
            for (var k5 = i5; k5 < hojayCopade.COPADE.length; k5++) {
                if (hojayCopade.COPADE[i5][0] === hojayCopade.COPADE[k5][0]) {
                    importeCopade = importeCopade + hojayCopade.COPADE[k5][1];
                    sumaCopade = sumaCopade + 1;
                    hojayCopade.COPADE[k5][1] = 0;
                }
            }
            if (importeCopade !== 0) {
                ArrayCopade.push([hojayCopade.COPADE[i5][0], importeCopade, sumaCopade]);
            }
        }
        copadeTotal.push('Total general');
        for (var k2 = 0; k2 < ArrayCopade.length; k2++) {
            sumaImporteCopade = sumaImporteCopade + ArrayCopade[k2][1];
            sumaContadorCopade = sumaContadorCopade + ArrayCopade[k2][2];
        }
        copadeTotal.push(sumaImporteCopade);
        copadeTotal.push(sumaContadorCopade);

        entradaTotal.push('Total general');
        for (var k3 = 0; k3 < ArrayEntrada.length; k3++) {
            sumaImporteEntrada = sumaImporteEntrada + ArrayEntrada[k3][1];
            sumaContadorEntrada = sumaContadorEntrada + ArrayEntrada[k3][2];
        }
        entradaTotal.push(sumaImporteEntrada);
        entradaTotal.push(sumaContadorEntrada);
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
        for (var i3 = 0; i3 < exercise.length; i3++) {
            realChart[i3] = exercise[i3].AA + exercise[i3].CGDUOS + exercise[i3].GMDE + exercise[i3].GMGE + exercise[i3].GMM + exercise[i3].GMOPI +
            exercise[i3].CSTPIP + exercise[i3].GSMCCIT + exercise[i3].GSSLT + exercise[i3].GMSSTPA;
            realTableSuma = realTableSuma + realChart[i3];
            realChart[i3] = numeral(realChart[i3]).divide(1000000).format('0');
            realTable[i3] = realChart[i3];
            adecSumaAvance = adecSumaAvance + parseFloat(adecChart[i3]);
            e_AA = e_AA + exercise[i3].AA;
            e_CGDUOS = e_CGDUOS+ exercise[i3].CGDUOS;
            e_GMDE = e_GMDE + exercise[i3].GMDE;
            e_GMGE = e_GMGE + exercise[i3].GMGE;
            e_GMM = e_GMM + exercise[i3].GMM;
            e_GMOPI = e_GMOPI + exercise[i3].GMOPI;
            e_CSTPIP = e_CSTPIP + exercise[i3].CSTPIP;
            e_GSMCCIT = e_GSMCCIT + exercise[i3].GSMCCIT;
            e_GSSLT = e_GSSLT + exercise[i3].GSSLT;
            e_GMSSTPA = e_GMSSTPA + exercise[i3].GMSSTPA;
        }
        realTableSuma =  numeral(realTableSuma).divide(1000000).format('0');
        for (var i4=realTable.length; i4<12; i4++){
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
        let pres = new pptxgen();
        pres.layout = 'LAYOUT_4x3';
        var today = new Date();
        var dia = today.getDate();
        var mes;
        switch (today.getMonth()) {
            case 0:
                mes = 'enero';
                break;
            case 1:
                mes = 'febrero';
                break;
            case 2:
                mes = 'marzo';
                break;
            case 3:
                mes = 'abril';
                break;
            case 4:
                mes = 'mayo';
                break;
            case 5:
                mes = 'junio';
                break;
        }
        var ano = today.getFullYear();
        var filename = `Estado actual ppto-${dia}-${mes}-${ano}`;
        // Slide 1
        let slide1 = pres.addSlide();
        slide1.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
        slide1.addText('Activo de Producción Veracruz', { x: 0, y: 2, w: 10, h:0.5, color: 'B38E5D', align: 'center', fontFace:'Montserrat Regular', fontSize: 20});
        slide1.addText('Revisión del presupuesto de Inversión 2020', { x: 0, y: 2.3, w: 10, h:0.5, color: 'B38E5D', align: 'center', fontFace:'Montserrat Regular', fontSize: 18});
        slide1.addText('SUBDIRECCIÓN DE PRODUCCIÓN REGIÓN NORTE', { x: 0, y: 3, w: 10, h:0.5, color: 'B38E5D', align: 'center', fontFace:'Montserrat Regular', fontSize: 21});
        slide1.addShape(pres.shapes.LINE,      { x:1.13, y:3.5, w:7.74, h:0.0, line:'B38E5D', lineSize:4 });
        slide1.addText('Pemex Exploración y Producción', { x: 0, y: 3.6, w: 10, h:0.5, color: 'BC955C', align: 'center', fontFace:'Montserrat Regular', fontSize: 18, bold:true});
        slide1.addText(`Boca del Río, Veracruz ${dia} de ${mes} de ${ano}`, { x: 0, y: 4.2, w: 10, h:0.5, color: 'BC955C', align: 'center', fontFace:'Montserrat Regular', fontSize: 18, bold:true});
        slide1.addImage({ path:'./logo-pemex.png', x:3.04, y:5.5, w:3.93, h:1.57 });
        // Slide 2
        let slide2 = pres.addSlide();
        slide2.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
        slide2.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
        slide2.addText('PRESUPUESTO DE INVERSIÓN', { x: 2.13, y: 2.58, w:7.54, h:1.12, color: 'B38E5D', align: 'right', fontFace:'Montserrat Regular', fontSize: 21, bold: true});
        slide2.addShape(pres.shapes.LINE,      { x:2.13, y:4, w:7.54, h:0.0, line:'B38E5D', lineSize:4 });
        // Slide 3
        let slide3 = pres.addSlide();
        var Meses = ['Ene','Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul','Ago','Sep', 'Oct','Nov','Dic'];
        var arrDataLineStat = [];
        var tmpObjRed = { name:'REAL', labels:Meses, values:realChart};
        var tmpObjAmb = { name:'ADEC II', labels:Meses, values:adecChart};
        arrDataLineStat.push( tmpObjRed );
        arrDataLineStat.push( tmpObjAmb );
        var optsChartLine1 = {
            x:0.5,
            y:1.6,
            w:9.0,
            h:2,
            catAxisLabelFontBold: true,
            catAxisLabelFontFace: 'Montserrat SemiBold',
            catAxisLabelFontSize: 15,
            chartColors: [ '691B31', '41955B'],
            lineSize  : 4,
            lineSmooth: false,
            showLegend: true,
            legendPos: 't',
            legendFontSize:20,
            legendFontFace:'Montserrat SemiBold',
            lineDataSymbol: 'diamond',
            lineDataSymbolSize: 13,
            showValue:true,
            legendColor: '000000',
            valAxisHidden:true,
            catAxisLabelPos: 'high',
            valGridLine: {style: 'none'},
            dataLabelFontBold: true,
            dataLabelFontSize: 14,
            dataLabelPosition: 't'
        };
        var AdecuadoAnual = [{ text: 'ADEC II', options: { fill: '606060' } }, adecChart[0],adecChart[1],adecChart[2],adecChart[3],adecChart[4],adecChart[5],adecChart[6],adecChart[7],adecChart[8],adecChart[9],adecChart[10],adecChart[11],adecTableSuma];
        var AdecuadoReal = [{ text: 'REAL', options: { color: 'ff0000', fill: '606060' } }, realTable[0],realTable[1],realTable[2],realTable[3],realTable[4],realTable[5],realTable[6],realTable[7],realTable[8],realTable[9],realTable[10],realTable[11], { text: realTableSuma, options: { color: '691B31'}}];
        var TablaDiapositiva3 =  [];
        TablaDiapositiva3.push(AdecuadoAnual);
        TablaDiapositiva3.push(AdecuadoReal);
        slide3.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
        slide3.addChart( pres.charts.LINE, arrDataLineStat, optsChartLine1);
        slide3.addTable( TablaDiapositiva3, {x: 0.5, y: 4.4, fill: 'f2f2f2', fontFace:'Montserrat Regular', fontSize: 18, bold:true, align: 'center', border: {type: 'solid', pt:3 } } );
        slide3.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
        slide3.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
        slide3.addText('Devengable', { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
        slide3.addText(tableInversion[4], { shape:pres.shapes.OVAL, x:2, y:5.6, w:1.4, h:0.73, fill:'FF0000', color:'FFFFFF', align:'center', fontSize:21,bold:true });
        slide3.addText(`Cumplimiento del periodo ${mesInicial} - ${mesFinal}`, {x: 1.84, y: 6.3, w: 1.72, h:0.95, color: '000000', align: 'center', fontFace:'Arial', fontSize: 16.8});
        slide3.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
        slide3.addText('Cifras en millones de pesos', { x: 6.6, y: 0.98, w: 3.2, h:0.29, color: 'FFFFFF', align: 'center', fontFace:'Montserrat Regular', fontSize: 17, bold:true});
        // Slide 4
        let slide4 = pres.addSlide();

        var arrDataLineStat2 = [];
        var tmpObjRed1 = { name:'Ejercicio', labels:dias, values:totalEjercicio};
        arrDataLineStat2.push( tmpObjRed1 );
        var optsChartLine3 = {
            x:0.5,
            y:1.2,
            w:9.0,
            h:5.2,
            catAxisLabelFontBold: true,
            catAxisLabelFontFace: 'Montserrat SemiBold',
            catAxisLabelFontSize: 12,
            chartColors: [ '41955B'],
            lineSize  : 3,
            lineSmooth: false,
            showLegend: false,
            legendPos: 't',
            legendFontSize:20,
            legendFontFace:'Montserrat SemiBold',
            lineDataSymbol: 'diamond',
            lineDataSymbolSize: 12,
            showValue:false,
            legendColor: '000000',
            valAxisHidden:true,
            catAxisLabelPos: 'high',
            valGridLine: {style: 'none'},
            dataLabelFontBold: true,
            dataLabelFontSize: 14,
            dataLabelPosition: 't'
        };
        var TablaDiapositiva4 = [];
        var Cabezera = [{text: 'Periodo', options: {bold: true, color:'FFFFFF', fill:'42955B', fontSize: 12}},{text: 'Adec II', options:
             {bold: true,fill:'42955B', color:'FFFFFF', fontSize: 12}}, {text: 'Ejer', options: {bold: true, fill:'42955B',color:'FFFFFF', fontSize: 12}}, {text: '%', options: {bold: true, fill:'42955B',color:'FFFFFF', fontSize: 12}} ];
        var Datos = [{text: `${mesInicial} - ${mesFinal}`, options:{bold:true, fill:'CFDDD2', color:'000000', fontSize: 12}}, {text: `${tableInversion[1]}`, options:{bold:true, fill:'CFDDD2',color:'000000', fontSize: 12}}, {text: `${tableInversion[2]}`, options:{bold:true,fill:'CFDDD2', color:'000000', fontSize: 12}}, {text: `${tableInversion[4]}`, options:{bold:true, color:'000000', fill:'CFDDD2',fontSize: 12}}];
        TablaDiapositiva4.push(Cabezera);
        TablaDiapositiva4.push(Datos);
        slide4.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
        slide4.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
        slide4.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
        slide4.addText(`Ejercicio presupuestal ${mesInicial} - ${mesFinal} ${ano}`, { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
        var x=1.07;
        var x2 = 1.05;
        var bgcolor;
        for(let i = 0; i <= monthDiff; i++) {
            (i%2===0) ? bgcolor = 'E6B8B7' : bgcolor ='F2DCDB';
            slide4.addShape(pres.shapes.RECTANGLE,{ x:x2, y:1.7, w:1.63, h:3.64, fill:bgcolor });
            slide4.addText(anoSlide4[i], {x:x, y:1.66, w:2,h:0.4, color: '000000', fontFace:'Montserrat Regular', fontSize:18, bold: true });
            x = x+1.63;
            x2 =x2+1.63;
        }
        slide4.addChart( pres.charts.LINE, arrDataLineStat2, optsChartLine3);
        //slide4.addTable(TablaDiapositiva4, {x:5.5, y:5.3, w: 4, align: 'center', fontFace:'Montserrat Regular', border: {color: 'FFFFFF', pt:1}});
        slide4.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });


        // Slide 5
        let diapositiva5 = pres.addSlide();
        var colorAA;
        var colorCGDUOS;
        var colorGMDE;
        var colorGMGE;
        var colorGMM;
        var colorGMOPI;
        var colorSPRN;
        var colorCSTPIP;
        var colorGSMCCIT;
        var colorGSSLT;
        var colorSASEP;
        var colorGMSSTPA;
        var colorSSSTPA;
        var colorTotalInversion;
        var colorAARecepcionado;
        var colorCGDUOSRecepcionado;
        var colorGMDERecepcionado;
        var colorGMGERecepcionado;
        var colorGMMRecepcionado;
        var colorGMOPIRecepcionado;
        var colorSPRNRecepcionado;
        var colorCSTPIPRecepcionado;
        var colorGSMCCITRecepcionado;
        var colorGSSLTRecepcionado;
        var colorSASEPRecepcionado;
        var colorGMSSTPARecepcionado;
        var colorSSSTPARecepcionado;
        var colorTotalInversionRecepcionado;

(parseFloat(tableAA[4]) < 0) ? colorAA = 'FF0000' : colorAA = '000000';
(parseFloat(tableCGDUOS[4]) < 0) ? colorCGDUOS = 'FF0000' : colorCGDUOS = '000000';
(parseFloat(tableGMDE[4]) < 0) ? colorGMDE = 'FF0000' : colorGMDE = '000000';
(parseFloat(tableGMGE[4]) < 0) ? colorGMGE = 'FF0000' : colorGMGE = '000000';
(parseFloat(tableGMM[4]) < 0) ? colorGMM = 'FF0000' : colorGMM = '000000';
(parseFloat(tableGMOPI[4]) < 0) ? colorGMOPI = 'FF0000' : colorGMOPI = '000000';
(parseFloat(tableSPRN[3]) < 0) ? colorSPRN = 'FF0000' : colorSPRN = '000000';
(parseFloat(tableCSTPIP[4]) < 0) ? colorCSTPIP = 'FF0000' : colorCSTPIP = '000000';
(parseFloat(tableGSMCCIT[4]) < 0) ? colorGSMCCIT = 'FF0000' : colorGSMCCIT = '000000';
(parseFloat(tableGSSLT[4]) < 0) ? colorGSSLT = 'FF0000' : colorGSSLT = '000000';
(parseFloat(tableSASEP[3]) < 0) ? colorSASEP = 'FF0000' : colorSASEP = '000000';
(parseFloat(tableGMSSTPA[4]) < 0) ? colorGMSSTPA = 'FF0000' : colorGMSSTPA = '000000';
(parseFloat(tableSSSTPA[3]) < 0) ? colorSSSTPA = 'FF0000' : colorSSSTPA = '000000';
(parseFloat(tableInversion[3]) < 0) ? colorTotalInversion = 'FF0000' : colorTotalInversion = '000000';
(parseFloat(tableAARecepcionado[2]) < 0) ? colorAARecepcionado = 'FF0000' : colorAARecepcionado = '000000';
(parseFloat(tableCGDUOSRecepcionado[2]) < 0) ? colorCGDUOSRecepcionado = 'FF0000' : colorCGDUOSRecepcionado = '000000';
(parseFloat(tableGMDERecepcionado[2]) < 0) ? colorGMDERecepcionado = 'FF0000' : colorGMDERecepcionado = '000000';
(parseFloat(tableGMGERecepcionado[2]) < 0) ? colorGMGERecepcionado = 'FF0000' : colorGMGERecepcionado = '000000';
(parseFloat(tableGMMRecepcionado[2]) < 0) ? colorGMMRecepcionado = 'FF0000' : colorGMMRecepcionado = '000000';
(parseFloat(tableGMOPIRecepcionado[2]) < 0) ? colorGMOPIRecepcionado = 'FF0000' : colorGMOPIRecepcionado = '000000';
(parseFloat(tableSPRNRecepcionado[2]) < 0) ? colorSPRNRecepcionado = 'FF0000' : colorSPRNRecepcionado = '000000';
(parseFloat(tableCSTPIPRecepcionado[2]) < 0) ? colorCSTPIPRecepcionado = 'FF0000' : colorCSTPIPRecepcionado = '000000';
(parseFloat(tableGMCCITRecepcionado[2]) < 0) ? colorGSMCCITRecepcionado = 'FF0000' : colorGSMCCITRecepcionado = '000000';
(parseFloat(tableGSSLTRecepcionado[2]) < 0) ? colorGSSLTRecepcionado = 'FF0000' : colorGSSLTRecepcionado = '000000';
(parseFloat(tableSASEPRecepcionado[2]) < 0) ? colorSASEPRecepcionado = 'FF0000' : colorSASEPRecepcionado = '000000';
(parseFloat(tableGMSSTPARecepcionado[2]) < 0) ? colorGMSSTPARecepcionado = 'FF0000' : colorGMSSTPARecepcionado = '000000';
(parseFloat(tableSSSTPARecepcionado[2]) < 0) ? colorSSSTPARecepcionado = 'FF0000' : colorSSSTPARecepcionado = '000000';
(parseFloat(tableTotalInversionRecepcionado[2]) < 0) ? colorTotalInversionRecepcionado = 'FF0000' : colorTotalInversionRecepcionado = '000000';



colorAARecepcionado;
var presupuesoTable = [];
var recepcionadoTable = [];
presupuesoTable.push([{text: '', options: {}},'', {text: `Periodo (${mesInicial} - ${mesFinal})`, options: {fill: 'DCE6F1', bold: true, colspan: 4}}]);
presupuesoTable.push([{text:'Subdirección', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},{text:'GM', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},{text:'Autorizado', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},{text:'Ejercicio', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},{text:'Desviación', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},{text:'Avance', options: {fill: 'DCE6F1', bold:true, fontSize: 10}},]);
presupuesoTable.push([{text: tableAA[0]}, {text: tableAA[1]}, {text: tableAA[2]}, {text: tableAA[3]}, {text: tableAA[4], options: {color:colorAA}}, {text: tableAA[5]}]);
presupuesoTable.push([{text: tableCGDUOS[0]}, {text: tableCGDUOS[1]}, {text: tableCGDUOS[2]}, {text: tableCGDUOS[3]}, {text: tableCGDUOS[4], options: {color:colorCGDUOS}}, {text: tableCGDUOS[5]}]);
presupuesoTable.push([{text: tableGMDE[0]}, {text: tableGMDE[1]}, {text: tableGMDE[2]}, {text: tableGMDE[3]}, {text: tableGMDE[4], options: {color:colorGMDE}}, {text: tableGMDE[5]}]);
presupuesoTable.push([{text: tableGMGE[0]}, {text: tableGMGE[1]}, {text: tableGMGE[2]}, {text: tableGMGE[3]}, {text: tableGMGE[4], options: {color:colorGMGE}}, {text: tableGMGE[5]}]);
presupuesoTable.push([{text: tableGMM[0]}, {text: tableGMM[1]}, {text: tableGMM[2]}, {text: tableGMM[3]}, {text: tableGMM[4], options: {color:colorGMM}}, {text: tableGMM[5]}]);
presupuesoTable.push([{text: tableGMOPI[0]}, {text: tableGMOPI[1]}, {text: tableGMOPI[2]}, {text: tableGMOPI[3]}, {text: tableGMOPI[4], options: {color:colorGMOPI}}, {text: tableGMOPI[5]}]);
presupuesoTable.push([{text: tableSPRN[0], options: {bold: true, colspan: 2}}, {text:tableSPRN[1],options: {bold: true}}, {text:tableSPRN[2], options: {bold: true}},{text:tableSPRN[3], options: {color:colorSPRN, bold:true}},{text:tableSPRN[4], options: {bold: true}}]);
presupuesoTable.push([{text: tableCSTPIP[0]}, {text: tableCSTPIP[1]}, {text: tableCSTPIP[2]}, {text: tableCSTPIP[3]}, {text: tableCSTPIP[4], options: {color:colorCSTPIP}}, {text: tableCSTPIP[5]}]);
presupuesoTable.push([{text: tableGSMCCIT[0]}, {text: tableGSMCCIT[1]}, {text: tableGSMCCIT[2]}, {text: tableGSMCCIT[3]}, {text: tableGSMCCIT[4], options: {color:colorGSMCCIT}}, {text: tableGSMCCIT[5]}]);
presupuesoTable.push([{text: tableGSSLT[0]}, {text: tableGSSLT[1]}, {text: tableGSSLT[2]}, {text: tableGSSLT[3]}, {text: tableGSSLT[4], options: {color:colorGSSLT}}, {text: tableGSSLT[5]}]);
presupuesoTable.push([{text: tableSASEP[0], options: {bold: true, colspan: 2}}, {text:tableSASEP[1], options: {bold: true}},{text:tableSASEP[2], options: {bold: true}},{text: tableSASEP[3], options: {bold: true,color:colorSASEP}},{text:tableSASEP[4], options: {bold: true}}]);
presupuesoTable.push([{text: tableGMSSTPA[0]}, {text: tableGMSSTPA[1]}, {text: tableGMSSTPA[2]}, {text: tableGMSSTPA[3]}, {text: tableGMSSTPA[4], options: {color:colorGMSSTPA}}, {text: tableGMSSTPA[5]}]);
presupuesoTable.push([{text: tableSSSTPA[0], options: {bold: true, colspan: 2}}, {text:tableSSSTPA[1], options: {bold:true}},{text:tableSSSTPA[2], options: {bold:true}},{text:tableSSSTPA[3], options: {bold:true, color:colorSSSTPA}},{text:tableSSSTPA[4], options: {bold:true}}]);
presupuesoTable.push([{text: tableInversion[0], options: {bold: true, colspan: 2}}, {text:tableInversion[1], options: {bold:true}},{text:tableInversion[2], options: {bold:true}},{text:tableInversion[3], options: {bold: true, color:colorTotalInversion}},{text:tableInversion[4], options: {bold:true}}]);

recepcionadoTable.push([{text: 'Registro', options: {fill: 'EBF1DE', bold: true, colspan: 4}}]);
recepcionadoTable.push([{text:'Recepcionado', options: {fill: 'EBF1DE', bold: true, fontSize: 10}}, {text: 'Ejercicio+Recep.', options: {fill:'EBF1DE', bold:true, fontSize: 10}},{text: 'Desviación', options: {fill:'EBF1DE', bold:true, fontSize: 10}}, {text: 'Avance', options: {fill:'EBF1DE', bold:true, fontSize: 10}},]);
recepcionadoTable.push([{text: tableAARecepcionado[0]}, {text: tableAARecepcionado[1]}, {text: tableAARecepcionado[2], options: {color:colorAARecepcionado}}, {text: tableAARecepcionado[3]}]);
recepcionadoTable.push([{text: tableCGDUOSRecepcionado[0]}, {text: tableCGDUOSRecepcionado[1]}, {text: tableCGDUOSRecepcionado[2], options: {color:colorCGDUOSRecepcionado}}, {text: tableCGDUOSRecepcionado[3]}]);
recepcionadoTable.push([{text: tableGMDERecepcionado[0]}, {text: tableGMDERecepcionado[1]},{text: tableGMDERecepcionado[2], options: {color:colorGMDERecepcionado}}, {text: tableGMDERecepcionado[3]}]);
recepcionadoTable.push([{text: tableGMGERecepcionado[0]}, {text: tableGMGERecepcionado[1]},{text: tableGMGERecepcionado[2], options: {color:colorGMGERecepcionado}}, {text: tableGMGERecepcionado[3]}]);
recepcionadoTable.push([{text: tableGMMRecepcionado[0]}, {text: tableGMMRecepcionado[1]},{text: tableGMMRecepcionado[2], options: {color:colorGMMRecepcionado}}, {text: tableGMMRecepcionado[3]}]);
recepcionadoTable.push([{text: tableGMOPIRecepcionado[0]}, {text: tableGMOPIRecepcionado[1]}, {text: tableGMOPIRecepcionado[2], options: {color:colorGMOPIRecepcionado}}, {text: tableGMOPIRecepcionado[3]}]);
recepcionadoTable.push([{text: tableSPRNRecepcionado[0], options: {bold: true}}, {text:tableSPRNRecepcionado[1], options: {bold: true}},{text: tableSPRNRecepcionado[2], options: {bold: true,color:colorSPRNRecepcionado}},{text:tableSPRNRecepcionado[3], options: {bold: true}}]);

recepcionadoTable.push([{text: tableCSTPIPRecepcionado[0]}, {text: tableCSTPIPRecepcionado[1]}, {text: tableCSTPIPRecepcionado[2], options: {color:colorCSTPIPRecepcionado}}, {text: tableCSTPIPRecepcionado[3]}]);
recepcionadoTable.push([{text: tableGMCCITRecepcionado[0]}, {text: tableGMCCITRecepcionado[1]}, {text: tableGMCCITRecepcionado[2], options: {color:colorGSMCCITRecepcionado}}, {text: tableGMCCITRecepcionado[3]}]);
recepcionadoTable.push([{text: tableGSSLTRecepcionado[0]}, {text: tableGSSLTRecepcionado[1]}, {text: tableGSSLTRecepcionado[2], options: {color:colorGSSLTRecepcionado}}, {text: tableGSSLTRecepcionado[3]}]);
recepcionadoTable.push([{text: tableSASEPRecepcionado[0], options: {bold: true}}, {text:tableSASEPRecepcionado[1], options: {bold:true}},{text: tableSASEPRecepcionado[2], options: {bold: true,color:colorSASEPRecepcionado}},{text:tableSASEPRecepcionado[3], options: {bold:true}}]);

recepcionadoTable.push([{text: tableGMSSTPARecepcionado[0]}, {text: tableGMSSTPARecepcionado[1]},  {text: tableGMSSTPARecepcionado[2], options: {color:colorGMSSTPARecepcionado}}, {text: tableGMSSTPARecepcionado[3]}]);
recepcionadoTable.push([{text: tableSSSTPARecepcionado[0], options: {bold: true}},{text:tableSSSTPARecepcionado[1], options: {bold:true}},{text: tableSSSTPARecepcionado[2], options: {bold: true,color:colorSSSTPARecepcionado}},{text:tableSSSTPARecepcionado[3], options: {bold:true}}]);
recepcionadoTable.push([{text: tableTotalInversionRecepcionado[0], options: {bold: true}}, {text:tableTotalInversionRecepcionado[1], options: {bold:true}},{text: tableTotalInversionRecepcionado[2], options: {bold: true,color:colorTotalInversionRecepcionado}},{text:tableTotalInversionRecepcionado[3], options: {bold:true}}]);

diapositiva5.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
diapositiva5.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
diapositiva5.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
diapositiva5.addText('Devengable', { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
diapositiva5.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
diapositiva5.addText('Cifras en millones de pesos', { x: 6.6, y: 0.98, w: 3.2, h:0.29, color: 'FFFFFF', align: 'center', fontFace:'Montserrat Regular', fontSize: 17, bold:true});
diapositiva5.addTable(presupuesoTable, { x: 0.16, y: 1.8, color:'000000', fontSize: 10, w:5.45, align:'center', border: {color: 'D3D3D3', pt:1}});
diapositiva5.addTable(recepcionadoTable, { x: 5.71, y: 1.8, color:'000000', fontSize: 10, w:4.13, align:'center', fill: 'FFFFFF', border: {color: 'D3D3D3', pt:1}});
diapositiva5.addText(`Fecha de extracción: ${dia} de ${mes} de ${ano}`, { x: 0.16, y: 7, w: 3, h:0.27, color: '000000', align: 'center', fontFace:'Arial', fontSize: 10, bold:false});
// Slide 6
var HojadeEntradaTable = [];
HojadeEntradaTable.push(['ACREEDOR', 'IMPORTE', 'HOJA DE ENTRADA']);
COPADETable = [];
COPADETable.push(['ACREEDOR', 'IMPORTE', 'COPADES']);

var backgroundcolor;
for (var i1=0; i1 <ArrayEntrada.length; i1++) {
(i1%2===0) ? backgroundcolor = 'E6B8B7' : backgroundcolor = 'F2DCDB';
HojadeEntradaTable.push([
    { text: ArrayEntrada[i1][0], options: {color: '000000', fill: backgroundcolor} },
    { text: numeral(ArrayEntrada[i1][1]).format('$0,0.00'), options: {color: '000000', fill: backgroundcolor}},
    { text: ArrayEntrada[i1][2], options: {color: '000000', fill: backgroundcolor}}
]);
}
for (var i9=0; i9 <ArrayCopade.length; i9++) {
    (i9%2===0) ? backgroundcolor = 'E6B8B7' : backgroundcolor = 'F2DCDB';
    COPADETable.push([
        { text: ArrayCopade[i9][0], options: { color: '000000', fill: backgroundcolor} },
        { text: numeral(ArrayCopade[i9][1]).format('$0,0.00'), options: {color: '000000', fill: backgroundcolor}},
        { text: ArrayCopade[i9][2], options: {color: '000000', fill: backgroundcolor}}
    ]);
}
HojadeEntradaTable.push([entradaTotal[0], numeral(entradaTotal[1]).format('$0,0.00'), entradaTotal[2]]);
COPADETable.push([copadeTotal[0], numeral(copadeTotal[1]).format('$0,0.00'), copadeTotal[2]]);

let diapositiva6 = pres.addSlide();
diapositiva6.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
diapositiva6.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
diapositiva6.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
diapositiva6.addText('Recepcionado', { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
diapositiva6.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
diapositiva6.addText('Cifras en millones de pesos', { x: 6.6, y: 0.98, w: 3.2, h:0.29, color: 'FFFFFF', align: 'center', fontFace:'Montserrat Regular', fontSize: 17, bold:true});
diapositiva6.addText('Hoja de entrada', { x: 1.4, y: 1.52, w: 2.3, h:0.38, color: '000000', align: 'left', fontFace:'Montserrat Regular', fontSize: 20, bold:true});
diapositiva6.addTable(HojadeEntradaTable, { x: 1.4, y: 1.9, w: 7.5, fill: 'C0504D', color:'FFFFFF', bold:true, align:'center',colW: [3.5,2,2], border: {color: 'ffffff', pt:1}});
diapositiva6.addText('COPADES', { x: 1.4, y: 4.04, w: 1.43, h:0.38, color: '000000', align: 'left', fontFace:'Montserrat Regular', fontSize: 20, bold:true});
diapositiva6.addTable(COPADETable, { x: 1.4, y: 4.55, w: 7.5, fill: 'C0504D', color:'FFFFFF', bold:true, align:'center', colW: [3.5,2,2], border: {color: 'ffffff', pt:1}});
diapositiva6.addText(`Fecha de extracción: ${dia} de ${mes} de ${ano}`, { x: 0.16, y: 7, w: 3, h:0.27, color: '000000', align: 'center', fontFace:'Arial', fontSize: 10, bold:false});
// Slide 7
let slide7 = pres.addSlide();
slide7.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
slide7.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
slide7.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
slide7.addText('Comentarios', { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
slide7.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
// Write the file
pres.writeFile(filename)
.then(filename => {
    res.download(`./${filename}`);
});


        // res.status(200).json({
        //     status: 'Success',
        //     mesInicial,
        //     mesFinal,
        //     realChart,
        //     adecChart,
        //     realTable,
        //     adecTableSuma,
        //     realTableSuma,
        //     dias,
        //     totalEjercicio,
        //     tableAA,
        //     tableCGDUOS,
        //     tableGMDE,
        //     tableGMGE,
        //     tableGMM,
        //     tableGMOPI,
        //     tableSPRN,
        //     tableCSTPIP,
        //     tableGSMCCIT,
        //     tableGSSLT,
        //     tableSASEP,
        //     tableGMSSTPA,
        //     tableSSSTPA,
        //     tableInversion,
        //     tableAARecepcionado,
        //     tableCGDUOSRecepcionado,
        //     tableGMDERecepcionado,
        //     tableGMGERecepcionado,
        //     tableGMMRecepcionado,
        //     tableGMOPIRecepcionado,
        //     tableSPRNRecepcionado,
        //     tableCSTPIPRecepcionado,
        //     tableGMCCITRecepcionado,
        //     tableGSSLTRecepcionado,
        //     tableSASEPRecepcionado,
        //     tableGMSSTPARecepcionado,
        //     tableSSSTPARecepcionado,
        //     tableTotalInversionRecepcionado
        // });
    } catch (err) {
        console.log(err);
        next(err);
    }
};


