const authorizedBudget = require('../Models/authorizedBudgetModel');
const exercisedBudget = require('../Models/exerciseBudgetModel');
const receivedBudget = require('../Models/receivedBudgetModel');
const exerciseChart = require('../Models/exerciseChartModel');
const HojaCopade = require('../Models/HojaCopadeModel');
const AppError = require('../Helpers/appError');
const numeral = require('../Helpers/numeral');
const pptxgen = require('pptxgenjs');
const moment = require('moment-timezone');


exports.getPptx = async (req, res, next) => {
    // Array to convert date from 0 to 11 to a month.
    const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // Si no existen los campos necesarios, envía un error 400.
    if (!req.query.startDate || !req.query.endDate || !req.query.authName){
        return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
    }
    // Variables de la petición
    const startDate = moment(req.query.startDate).tz('America/Mexico_City').format();
    const endDate = moment(req.query.endDate).add(23, 'h').add(59, 'm').tz('America/Mexico_City').format();
    const authName = req.query.authName;
    var monthDiff = moment(endDate).month() - moment(startDate).month();
    // Si la fecha inicial es antes que la fecha de final, enviar un error 400.
    if (endDate - startDate < 0 ) {
        return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
    }
    // Variables para guardar el mesInicial y mesFinal
    var mesInicial;
    var mesFinal;
    // Variables para la Diapositiva 1.
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
    var dias = [];
    var totalEjercicio = [];
    // Otras variables
    var ArrayEntrada = [];
    var ArrayCopade = [];
    var entradaTotal = [];
    var sumaImporteEntrada = 0;
    var sumaContadorEntrada = 0;
    var copadeTotal = [];
    var sumaImporteCopade = 0;
    var sumaContadorCopade = 0;
    var anoSlide4 = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // Switch para darle nombre a cada mes
    mesInicial = MESES[moment(startDate).month()];
    mesFinal = MESES[moment(endDate).month()];
    // Bloque Try - Catch
    try {
        // Busca en la base de datos el autorizado solicitado en la petición
        var authorized = await authorizedBudget.findOne({authName});
        // Busca en la base de datos los ejercicios solicitados en la petición
        var exercise = await exercisedBudget.find({ exerciseDate: { $gte: startDate, $lte: endDate }});
        // Busca en la base de datos el último HojaCopade
        var hojayCopade = await HojaCopade.findOne().sort({createdAt: -1});
        // Busca en la base de datos el último Pedidos con recepción
        var received = await receivedBudget.findOne().sort({receivedDate: -1});
        var exerciseChartRes = await exerciseChart.find({exerciseDate: {$gte: startDate, $lte:endDate}});
        if (hojayCopade === null || authorized === null || exercise.length === 0
            || received === null || exerciseChartRes === null) {
            return next(new AppError(400, 'Not found', 'Faltan archivos para generar la presentación'));
        }
        for (let i = 0; i < exerciseChartRes.length; i++) {
            dias.push(exerciseChartRes[i].exerciseDate.toISOString().split('T')[0]);
            totalEjercicio.push(exerciseChartRes[i].exerciseTotal);
        }
        for (let i = 0; i < hojayCopade.HojadeEntrada.length; i++){
            var importe = 0;
            var suma = 0;
            for (let j = i; j < hojayCopade.HojadeEntrada.length; j++) {
                if (hojayCopade.HojadeEntrada[i][0] === hojayCopade.HojadeEntrada[j][0]) {
                    importe = importe + hojayCopade.HojadeEntrada[j][1];
                    suma = suma + 1;
                    hojayCopade.HojadeEntrada[j][1] = 0;
                }
            }
            if (importe !== 0) {
                ArrayEntrada.push([hojayCopade.HojadeEntrada[i][0], importe, suma]);
            }
        }
        for (let i = 0; i < hojayCopade.COPADE.length; i++){
            var importeCopade = 0;
            var sumaCopade = 0;
            for (let j = i; j < hojayCopade.COPADE.length; j++) {
                if (hojayCopade.COPADE[i][0] === hojayCopade.COPADE[j][0]) {
                    importeCopade = importeCopade + hojayCopade.COPADE[j][1];
                    sumaCopade = sumaCopade + 1;
                    hojayCopade.COPADE[j][1] = 0;
                }
            }
            if (importeCopade !== 0) {
                ArrayCopade.push([hojayCopade.COPADE[i][0], importeCopade, sumaCopade]);
            }
        }
        copadeTotal.push('Total general');
        for (let i = 0; i < ArrayCopade.length; i++) {
            sumaImporteCopade = sumaImporteCopade + ArrayCopade[i][1];
            sumaContadorCopade = sumaContadorCopade + ArrayCopade[i][2];
        }
        copadeTotal.push(sumaImporteCopade);
        copadeTotal.push(sumaContadorCopade);

        entradaTotal.push('Total general');
        for (let i = 0; i < ArrayEntrada.length; i++) {
            sumaImporteEntrada = sumaImporteEntrada + ArrayEntrada[i][1];
            sumaContadorEntrada = sumaContadorEntrada + ArrayEntrada[i][2];
        }
        entradaTotal.push(sumaImporteEntrada);
        entradaTotal.push(sumaContadorEntrada);
        for (let j = moment(startDate).month(); j <= moment(startDate).month() + monthDiff; j++){
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
        for (let j = 0; j <= 11; j++){
            adecChart[j] = authorized.AA[j] + authorized.CGDUOS[j] + authorized.GMDE[j] + authorized.GMGE[j] +
            authorized.GMM[j] + authorized.GMOPI[j] + authorized.CSTPIP[j] + authorized.GSMCCIT[j]+ authorized.GSSLT[j] + authorized.GMSSTPA[j];
            adecTableSuma = adecTableSuma + adecChart[j];
            adecChart[j] = numeral(adecChart[j]).divide(1000000).format('0');
        }
        for (let i = 0; i < exercise.length; i++) {
            realChart[i] = exercise[i].AA + exercise[i].CGDUOS + exercise[i].GMDE + exercise[i].GMGE + exercise[i].GMM + exercise[i].GMOPI +
            exercise[i].CSTPIP + exercise[i].GSMCCIT + exercise[i].GSSLT + exercise[i].GMSSTPA;
            realTableSuma = realTableSuma + realChart[i];
            realChart[i] = numeral(realChart[i]).divide(1000000).format('0');
            realTable[i] = realChart[i];
            adecSumaAvance = adecSumaAvance + parseFloat(adecChart[i]);
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
        for (let i=realTable.length; i<12; i++){
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
        var today = exercise[exercise.length-1].createdAt;
        var dia = today.getDate();
        var mes = MESES[today.getMonth()];
        var ano = today.getFullYear();
        var filename = `Estado-actual-ppto-${dia}-${mes}-${ano}`;
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
        slide2.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
        // Slide 3
        let slide3 = pres.addSlide();
        var Meses = ['Ene','Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul','Ago','Sep', 'Oct','Nov','Dic'];
        var arrDataLineStat = [];
        var tmpObjRed = { name:'REAL', labels:Meses, values:realChart};
        var tmpObjAmb = { name:'ADEC III', labels:Meses, values:adecChart};
        arrDataLineStat.push( tmpObjRed );
        arrDataLineStat.push( tmpObjAmb );
        var optsChartLine1 = {
            x:0.5,
            y:1.6,
            w:9.0,
            h:2.5,
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
        var AdecuadoAnual = [{ text: 'ADEC III', options: { fill: '606060' } }, adecChart[0],adecChart[1],adecChart[2],adecChart[3],adecChart[4],adecChart[5],adecChart[6],adecChart[7],adecChart[8],adecChart[9],adecChart[10],adecChart[11],adecTableSuma];
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
            h:5.5,
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
        var Cabezera = [{text: 'Periodo', options: {bold: true, color:'FFFFFF', fill:'42955B', fontSize: 12}},{text: 'Adec III', options:
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
        var x3 = 1.96;
        var bgcolor;
        var sumaSlide4= 0;
        var chartSpace =  8.26 / exerciseChartRes.length; // Space per point in inch.
        var lunesenMeses = [4, 4, 5, 4, 4, 5, 4, 5, 4, 4, 5, 4];
        var space = [];
        for (let i = 0; i < lunesenMeses.length; i++) {
            space.push(chartSpace*lunesenMeses[i]);
        }
        var middlemonth = 0;
        slide4.addChart( pres.charts.LINE, arrDataLineStat2, optsChartLine3);
        for(let i = 0; i <= monthDiff; i++) {
            sumaSlide4 = sumaSlide4 + parseInt(realTable[i]);
            middlemonth = middlemonth + lunesenMeses[i];
            (i%2===0) ? bgcolor = 'E6B8B7' : bgcolor ='F2DCDB';
            slide4.addShape(pres.shapes.RECTANGLE,{ x:x2, y:2.01, w:space[i], h:4.07, fill:bgcolor });
            slide4.addText(anoSlide4[i], {x:x, y:1.66, w:2,h:0.4, color: '000000', fontFace:'Montserrat Regular', fontSize:18, bold: true });
            slide4.addText(sumaSlide4, {x:x3, y:3,w:0.8,h:0.4, color: '000000', fontFace:'Montserrat Regular', fontSize:18, bold: true });
            x = x + space[i];
            x2 = x2 + space[i];
            x3 = x3 + space[i];
        }
        slide4.addTable(TablaDiapositiva4, {x:5.2, y:4.64, w: 4, align: 'center', fontFace:'Montserrat Regular', border: {color: 'FFFFFF', pt:1}});
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
for (let i=0; i <ArrayCopade.length; i++) {
    (i%2===0) ? backgroundcolor = 'E6B8B7' : backgroundcolor = 'F2DCDB';
    COPADETable.push([
        { text: ArrayCopade[i][0], options: { color: '000000', fill: backgroundcolor} },
        { text: numeral(ArrayCopade[i][1]).format('$0,0.00'), options: {color: '000000', fill: backgroundcolor}},
        { text: ArrayCopade[i][2], options: {color: '000000', fill: backgroundcolor}}
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
diapositiva6.addText('Hoja de entrada', { x: 1.4, y: 1.52, w: 2.3, h:0.38, color: '000000', align: 'left', fontFace:'Montserrat Regular', fontSize: 18, bold:true});
diapositiva6.addTable(HojadeEntradaTable, { x: 1.4, y: 1.9, w: 7.5, fill: 'C0504D', color:'FFFFFF', bold:true, align:'center',colW: [3.5,2,2], fontSize: 10.5, border: {color: 'ffffff', pt:1}});
diapositiva6.addText('COPADES', { x: 1.4, y: 4.04, w: 1.43, h:0.38, color: '000000', align: 'left', fontFace:'Montserrat Regular', fontSize: 18, bold:true});
diapositiva6.addTable(COPADETable, { x: 1.4, y: 4.55, w: 7.5, fill: 'C0504D', color:'FFFFFF', bold:true, align:'center', colW: [3.5,2,2], fontSize: 10.5, border: {color: 'ffffff', pt:1}});
diapositiva6.addText(`Fecha de extracción: ${dia} de ${mes} de ${ano}`, { x: 0.16, y: 7, w: 3, h:0.27, color: '000000', align: 'center', fontFace:'Arial', fontSize: 10, bold:false});
// Slide 7
let slide7 = pres.addSlide();
slide7.addImage({ path:'./fondo-recortado.png', x:0, y:0, w:10.0, h:7.5 });
slide7.addText(`Presupuesto de Inversión ${ano}`, { x: 0.21, y: 0.06, w: 7.8, h:0.59, color: '000000', align: 'right', fontFace:'Montserrat SemiBold', fontSize: 19.2, bold:true});
slide7.addImage({ path:'./logo-mexico.png', x:8.05, y:0.11, w:1.45, h:0.54});
slide7.addText('Comentarios', { shape:pres.shapes.RECTANGLE, x:0.14, y:0.93, w:9.68, h:0.45, fill:'691B31', align:'left', fontFace:'Montserrat Regular', fontSize:20, bold: true, color: 'FFFFFF' });
slide7.addImage({ path:'./logo-pemex.png', x:8.4, y:6.57, w:1.42, h:0.66 });
// Write the file
pres.writeFile(`./downloads/${filename}`)
.then(filename => {
    res.download(`./${filename}`);
});
    } catch (err) {
        console.log(err);
        next(err);
    }
};
