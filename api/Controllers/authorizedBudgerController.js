var Excel = require('exceljs');
const authorizedBudget = require('../Models/authorizedBudgetModel');
const AppError = require('../Helpers/appError');

var subdireccion = [];
var gm = [];
var idProyD = [];
var concepto = [];
var centroGestor = [];
var fondo = [];
var programaPresupuestal = [];
var ePep6Nivel = [];
var posicionFinanciera = [];
var moneda = [];
var contrato = [];
var reservaPptal = [];
var pedido = [];
var solPed = [];
var solicitudContratacion = [];
var folioRaf = [];
var folioAres = [];
var enTecho = [];
var descdeActividad = [];
var nuevoRequerimiento = [];
var instalacion = [];
var idSeguimiento = [];
var nombrePozoObraEmbarcacion = [];
var asuntosRelevantes = [];
var elabora = [];
var dEne = [];
var dFeb = [];
var dMar = [];
var dAbr = [];
var dMay = [];
var dJun = [];
var dJul = [];
var dAgo = [];
var dSep = [];
var dOct = [];
var dNov = [];
var dDic = [];
var fEne = [];
var fFeb = [];
var fMar = [];
var fAbr = [];
var fMay = [];
var fJun = [];
var fJul = [];
var fAgo = [];
var fSep = [];
var fOct = [];
var fNov = [];
var fDic = [];
var fEneAsgte = [];
var fFebAsgte = [];
var fMarAsgte = [];
var fAbrAsgte = [];
var fMayAsgte = [];
var fJunAsgte = [];
var dTotal = [];
var fTotal = [];
var adefaInicial = [];
var adefaFinal = [];
var tipoPresupuesto = [];



exports.createAuthorized = async (req, res, next) => {
    var inputRow = [];
    const authorizedName = req.body.authorizedName;
    var sheetName = req.body.sheetName;
    try {
        if (!req.file || !req.body.authorizedName){
            return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
        }
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(req.file.path)
        .then(async () => {
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row, rowNumber) => {
                if(rowNumber !== 1){
                    row.eachCell((cell, colNumber) => {
                        inputRow.push(cell.value);
                    });
                    subdireccion.push(inputRow[0]);
                    gm.push(inputRow[1]);
                    idProyD.push(inputRow[2]);
                    concepto.push(inputRow[3]);
                    centroGestor.push(inputRow[4]);
                    fondo.push(inputRow[5]);
                    programaPresupuestal.push(inputRow[6]);
                    ePep6Nivel.push(inputRow[7]);
                    posicionFinanciera.push(inputRow[8]);
                    moneda.push(inputRow[9]);
                    contrato.push(inputRow[10]);
                    reservaPptal.push(inputRow[11]);
                    pedido.push(inputRow[12]);
                    solPed.push(inputRow[13]);
                    solicitudContratacion.push(inputRow[14]);
                    folioRaf.push(inputRow[15]);
                    folioAres.push(inputRow[16]);
                    enTecho.push(inputRow[17]);
                    descdeActividad.push(inputRow[18]);
                    nuevoRequerimiento.push(inputRow[19]);
                    instalacion.push(inputRow[20]);
                    idSeguimiento.push(inputRow[21]);
                    nombrePozoObraEmbarcacion.push(inputRow[22]);
                    asuntosRelevantes.push(inputRow[23]);
                    elabora.push(inputRow[24]);
                    dEne.push(inputRow[25]);
                    dFeb.push(inputRow[26]);
                    dMar.push(inputRow[27]);
                    dAbr.push(inputRow[28]);
                    dMay.push(inputRow[29]);
                    dJun.push(inputRow[30]);
                    dJul.push(inputRow[31]);
                    dAgo.push(inputRow[32]);
                    dSep.push(inputRow[33]);
                    dOct.push(inputRow[34]);
                    dNov.push(inputRow[35]);
                    dDic.push(inputRow[36]);
                    fEne.push(inputRow[37]);
                    fFeb.push(inputRow[38]);
                    fMar.push(inputRow[39]);
                    fAbr.push(inputRow[40]);
                    fMay.push(inputRow[41]);
                    fJun.push(inputRow[42]);
                    fJul.push(inputRow[43]);
                    fAgo.push(inputRow[44]);
                    fSep.push(inputRow[45]);
                    fOct.push(inputRow[46]);
                    fNov.push(inputRow[47]);
                    fDic.push(inputRow[48]);
                    fEneAsgte.push(inputRow[49]);
                    fFebAsgte.push(inputRow[50]);
                    fMarAsgte.push(inputRow[51]);
                    fAbrAsgte.push(inputRow[52]);
                    fMayAsgte.push(inputRow[53]);
                    fJunAsgte.push(inputRow[54]);
                    dTotal.push(inputRow[55]);
                    fTotal.push(inputRow[56]);
                    adefaInicial.push(inputRow[57]);
                    adefaFinal.push(inputRow[58]);
                    tipoPresupuesto.push(inputRow[59]);
                }
                inputRow = [];
            });
            var authorized = await authorizedBudget.create({createdBy: req.user, createdAt: Date.now(), authorizedName: authorizedName, subdireccion: subdireccion,  gm: gm,
                idProyD: idProyD, concepto: concepto, centroGestor: centroGestor, fondo: fondo, programaPresupuestal: programaPresupuestal, ePep6Nivel: ePep6Nivel, posicionFinanciera: posicionFinanciera,
                moneda: moneda, contrato: contrato, reservaPptal: reservaPptal,  pedido: pedido, solPed: solPed, solicitudContratacion: solicitudContratacion, folioRaf: folioRaf, folioAres: folioAres,
                enTecho: enTecho, descdeActividad: descdeActividad, nuevoRequerimiento: nuevoRequerimiento, instalacion: instalacion, idSeguimiento: idSeguimiento,
                nombrePozoObraEmbarcacion: nombrePozoObraEmbarcacion, asuntosRelevantes:asuntosRelevantes,elabora: elabora, dEne:dEne, dFeb:dFeb, dMar: dMar, dAbr:dAbr, dMay:dMay, dJun:dJun,  dJul:dJul,
                dAgo: dAgo, dSep:dSep, dOct: dOct, dNov:dNov, dDic:dDic, fEne:fEne, fFeb:fFeb, fMar:fMar, fAbr:fAbr, fMay:fMay, fJun:fJun,fJul:fJul,fAgo:fAgo, fSep:fSep, fOct:fOct,  fNov:fNov, fDic:fDic,
                fEneAsgte: fEneAsgte, fFebAsgte:fFebAsgte, fMarAsgte:fMarAsgte, fAbrAsgte:fAbrAsgte, fMayAsgte:fMayAsgte, fJunAsgte:fJunAsgte, dTotal:dTotal, fTotal:fTotal, adefaInicial:adefaInicial,
                adefaFinal:adefaFinal, tipoPresupuesto:tipoPresupuesto});
            res.status(201).json({
                status: 'Created',
                data: {
                    authorized
                }
            });
        }).catch( (err) => {
            console.log(err);
            return next(new AppError(500, 'Server error', 'Something isn\'t rigth with the Excel File Reader.'));
        }).finally( () => {
            subdireccion = [];
            gm = [];
            idProyD = [];
            concepto = [];
            centroGestor = [];
            fondo = [];
            programaPresupuestal = [];
            ePep6Nivel = [];
            posicionFinanciera = [];
            moneda = [];
            contrato = [];
            reservaPptal = [];
            pedido = [];
            solPed = [];
            solicitudContratacion = [];
            folioRaf = [];
            folioAres = [];
            enTecho = [];
            descdeActividad = [];
            nuevoRequerimiento = [];
            instalacion = [];
            idSeguimiento = [];
            nombrePozoObraEmbarcacion = [];
            asuntosRelevantes = [];
            elabora = [];
            dEne = [];
            dFeb = [];
            dMar = [];
            dAbr = [];
            dMay = [];
            dJun = [];
            dJul = [];
            dAgo = [];
            dSep = [];
            dOct = [];
            dNov = [];
            dDic = [];
            fEne = [];
            fFeb = [];
            fMar = [];
            fAbr = [];
            fMay = [];
            fJun = [];
            fJul = [];
            fAgo = [];
            fSep = [];
            fOct = [];
            fNov = [];
            fDic = [];
            fEneAsgte = [];
            fFebAsgte = [];
            fMarAsgte = [];
            fAbrAsgte = [];
            fMayAsgte = [];
            fJunAsgte = [];
            dTotal = [];
            fTotal = [];
            adefaInicial = [];
            adefaFinal = [];
            tipoPresupuesto = [];
        });
    } catch (err) {
        console.log(err);
        next (err);
    }
};

exports.getAuthorized = async (req, res, next) => {
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
    var document;
    var name = req.query.name;
    const endDate = new Date(req.query.endDate);
    const startDate = new Date(req.query.startDate);
    var startMonth = startDate.getMonth();
    var endMonth = endDate.getMonth();
    var monthDiff = endMonth - startMonth;
    try {
        if (endDate - startDate < 0 ) {
            return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
        }
        else if (endDate - startDate >= 0) {
            for (k=0; k<=monthDiff; k++){
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
            var auth = await authorizedBudget.findOne({authorizedName: name});
            document = Object.values(auth._doc);
            var rowLength = document[0].length;
            for (var j = 0; j<=rowLength-1; j++){
                for (i=0; i<=monthDiff; i++){
                    switch (document[1][j]) {
                        case 'AA':
                            AA[i] = AA[i] + document[25+i+startMonth][j];
                            break;
                        case 'CGDUOS':
                            CGDUOS[i] = CGDUOS[i] + document[25+i+startMonth][j];
                            break;
                        case 'GMDE':
                            GMDE[i] = GMDE[i] + document[25+i+startMonth][j];
                            break;
                        case 'GMGE':
                            GMGE[i] = GMGE[i] + document[25+i+startMonth][j];
                            break;
                        case 'GMM':
                            GMM[i] = GMM[i] + document[25+i+startMonth][j];
                            break;
                        case 'GMOPI':
                            GMOPI[i] = GMOPI[i] + document[25+i+startMonth][j];
                            break;
                        case 'CSTPIP':
                            CSTPIP[i] = CSTPIP[i] + document[25+i+startMonth][j];
                            break;
                        case 'GSMCCIT':
                            GSMCCIT[i] = GSMCCIT[i] + document[25+i+startMonth][j];
                            break;
                        case 'GSSLT':
                            GSSLT[i] = GSSLT[i] + document[25+i+startMonth][j];
                            break;
                        case 'GMSSTPA':
                            GMSSTPA[i] = GMSSTPA[i] + document[25+i+startMonth][j];
                            break;
                    }
                }

            }
            res.status(200).json({
                status: 'Success',
                data: {
                    SPRN: {
                        AA,
                        CGDUOS,
                        GMDE,
                        GMGE,
                        GMM,
                        GMOPI
                    },
                    SASEP: {
                        CSTPIP,
                        GSMCCIT,
                        GSSLT
                    },
                    SSSTPA: {
                        GMSSTPA
                    }
                }
            });
        }

    } catch (err) {
        console.log(err);
        next(err);
    }
};
