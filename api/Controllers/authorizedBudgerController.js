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
                    dEne.push(inputRow[13]);
                    dFeb.push(inputRow[14]);
                    dMar.push(inputRow[15]);
                    dAbr.push(inputRow[16]);
                    dMay.push(inputRow[17]);
                    dJun.push(inputRow[18]);
                    dJul.push(inputRow[19]);
                    dAgo.push(inputRow[20]);
                    dSep.push(inputRow[21]);
                    dOct.push(inputRow[22]);
                    dNov.push(inputRow[23]);
                    dDic.push(inputRow[24]);
                    fEne.push(inputRow[25]);
                    fFeb.push(inputRow[26]);
                    fMar.push(inputRow[27]);
                    fAbr.push(inputRow[28]);
                    fMay.push(inputRow[29]);
                    fJun.push(inputRow[30]);
                    fJul.push(inputRow[31]);
                    fAgo.push(inputRow[32]);
                    fSep.push(inputRow[33]);
                    fOct.push(inputRow[34]);
                    fNov.push(inputRow[35]);
                    fDic.push(inputRow[36]);
                    fEneAsgte.push(inputRow[37]);
                    fFebAsgte.push(inputRow[38]);
                    fMarAsgte.push(inputRow[39]);
                    fAbrAsgte.push(inputRow[40]);
                    fMayAsgte.push(inputRow[41]);
                    fJunAsgte.push(inputRow[42]);
                    dTotal.push(inputRow[43]);
                    fTotal.push(inputRow[44]);
                    adefaInicial.push(inputRow[45]);
                    adefaFinal.push(inputRow[46]);
                    tipoPresupuesto.push(inputRow[47]);
                }
                inputRow = [];
            });
            var authorized = await authorizedBudget.create({createdBy: req.user, createdAt: Date.now(), authorizedName: authorizedName, subdireccion: subdireccion,  gm: gm,
                idProyD: idProyD, concepto: concepto, centroGestor: centroGestor, fondo: fondo, programaPresupuestal: programaPresupuestal, ePep6Nivel: ePep6Nivel, posicionFinanciera: posicionFinanciera,
                moneda: moneda, contrato: contrato, reservaPptal: reservaPptal,  pedido: pedido, dEne:dEne, dFeb:dFeb, dMar: dMar, dAbr:dAbr, dMay:dMay, dJun:dJun,  dJul:dJul,
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
    const endDate = new Date(req.query.endDate+ 'GMT-0600');
    const startDate = new Date(req.query.startDate+ 'GMT-0600');
    var startMonth = startDate.getMonth()+1;
    var endMonth = endDate.getMonth()+1;
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
            var AATotal = AA.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var CGDOSTotal = CGDUOS.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GMDETotal = GMDE.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GMGETotal = GMGE.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GMMTotal = GMM.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GMOPITotal = GMOPI.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var CSTPIPTotal = CSTPIP.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GSMCCITTotal = GSMCCIT.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GSSLTTotal = GSSLT.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            var GMSSTPATotal = GMSSTPA.reduce((valorAnterior, valorActual, indice, vector) => {
                return valorAnterior + valorActual; });
            res.status(200).json({
                status: 'Success',
                data: {
                    SPRN: {
                        'AA':AATotal,
                        'CGDUOS':CGDOSTotal,
                        'GMDE':GMDETotal,
                        'GMGE':GMGETotal,
                        'GMM':GMMTotal,
                        'GMOPI':GMOPITotal
                    },
                    SASEP: {
                        'CSTPIP':CSTPIPTotal,
                        'GSMCCIT':GSMCCITTotal,
                        'GSSLT':GSSLTTotal
                    },
                    SSSTPA: {
                        'GMSSTPA':GMSSTPATotal
                    }
                }
            });
        }

    } catch (err) {
        console.log(err);
        next(err);
    }
};
