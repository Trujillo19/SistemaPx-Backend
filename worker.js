let throng = require('throng');
let Queue = require('bull');
var Excel = require('exceljs');
const authorizedBudget = require('./api/Models/authorizedBudgetModel');
const AppError = require('./api/Helpers/appError');

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once.
let maxJobsPerWorker = 3;

function start() {
    // Connect to the named work queue
    const authQueue = new Queue('Authorized', REDIS_URL);
    authQueue.process(maxJobsPerWorker, async (job) => {
        try {
            var workbook = new Excel.Workbook();
            workbook.xlsx.readFile(job.data.filepath)
            .then(async () => {
                var worksheet = workbook.getWorksheet(job.data.sheetName);
                worksheet.eachRow((row, rowNumber) => {
                    if(rowNumber !== 1){
                        row.eachCell((cell, colNumber) => {
                            inputRow.push(cell.value);
                        });
                        subdireccion.push(inputRow[0]);
                        gm.push(inputRow[1]);
                        concepto.push(inputRow[2]);
                        centroGestor.push(inputRow[3]);
                        fondo.push(inputRow[4]);
                        programaPresupuestal.push(inputRow[5]);
                        posicionFinanciera.push(inputRow[6]);
                        contrato.push(inputRow[7]);
                        pedido.push(inputRow[8]);
                        dEne.push(inputRow[9]);
                        dFeb.push(inputRow[10]);
                        dMar.push(inputRow[11]);
                        dAbr.push(inputRow[12]);
                        dMay.push(inputRow[13]);
                        dJun.push(inputRow[14]);
                        dJul.push(inputRow[15]);
                        dAgo.push(inputRow[16]);
                        dSep.push(inputRow[17]);
                        dOct.push(inputRow[18]);
                        dNov.push(inputRow[19]);
                        dDic.push(inputRow[20]);
                        fEne.push(inputRow[21]);
                        fFeb.push(inputRow[22]);
                        fMar.push(inputRow[23]);
                        fAbr.push(inputRow[24]);
                        fMay.push(inputRow[25]);
                        fJun.push(inputRow[26]);
                        fJul.push(inputRow[27]);
                        fAgo.push(inputRow[28]);
                        fSep.push(inputRow[29]);
                        fOct.push(inputRow[30]);
                        fNov.push(inputRow[31]);
                        fDic.push(inputRow[32]);
                        fEneAsgte.push(inputRow[33]);
                        fFebAsgte.push(inputRow[34]);
                        fMarAsgte.push(inputRow[35]);
                        fAbrAsgte.push(inputRow[36]);
                        fMayAsgte.push(inputRow[37]);
                        fJunAsgte.push(inputRow[38]);
                        dTotal.push(inputRow[39]);
                        fTotal.push(inputRow[40]);
                        adefaInicial.push(inputRow[41]);
                        adefaFinal.push(inputRow[42]);
                        tipoPresupuesto.push(inputRow[43]);
                    }
                    inputRow = [];
                });
                var authorized = await authorizedBudget.create({createdBy: req.user, createdAt: Date.now(), authorizedName: authorizedName, subdireccion: subdireccion,  gm: gm,
                    concepto: concepto, centroGestor: centroGestor, fondo: fondo, programaPresupuestal: programaPresupuestal, posicionFinanciera: posicionFinanciera,
                    contrato: contrato, pedido: pedido, dEne:dEne, dFeb:dFeb, dMar: dMar, dAbr:dAbr, dMay:dMay, dJun:dJun,  dJul:dJul,
                    dAgo: dAgo, dSep:dSep, dOct: dOct, dNov:dNov, dDic:dDic, fEne:fEne, fFeb:fFeb, fMar:fMar, fAbr:fAbr, fMay:fMay, fJun:fJun,fJul:fJul,fAgo:fAgo, fSep:fSep, fOct:fOct,  fNov:fNov, fDic:fDic,
                    fEneAsgte: fEneAsgte, fFebAsgte:fFebAsgte, fMarAsgte:fMarAsgte, fAbrAsgte:fAbrAsgte, fMayAsgte:fMayAsgte, fJunAsgte:fJunAsgte, dTotal:dTotal, fTotal:fTotal, adefaInicial:adefaInicial,
                    adefaFinal:adefaFinal, tipoPresupuesto:tipoPresupuesto});
                console.log(authorized);

            }).catch( (err) => {
                console.log(err);
                return next(new AppError(500, 'Server error', 'Something isn\'t rigth with the Excel File Reader.'));
            }).finally( () => {
                subdireccion = [];
                gm = [];
                concepto = [];
                centroGestor = [];
                fondo = [];
                programaPresupuestal = [];
                posicionFinanciera = [];
                contrato = [];
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
        }
    });
}

// Initialize the clustered worker process
throng({ workers, start });
