const Queue = require('bull');
const throng = require('throng');
const Excel = require('exceljs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
var sorter = require('./api/Helpers/sortExercise');
const authorizedBudget = require('./api/Models/newAuthorizedBudgetModel');
const exercisedBudget = require('./api/Models/newExerciseBudgetModel');

// Production check.
if (process.env.NODE_ENV !== 'production'){
    dotenv.config({
        path: './config/development.env'
    });
}

const database = process.env.DB_URI;
mongoose.connect(database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( con => {
    console.log('Database connection successfully');
}).catch( error => {
    console.log('Database connection error.');
    console.log(error.name);
});

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 1;

// The maxium number of jobs each worker should process at once.
let maxJobsPerWorker = 5;

function start() {
    // Connect to the named work queue
    const authQueue = new Queue('Authorized', REDIS_URL);
    authQueue.process(maxJobsPerWorker, async (job, done) => {
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
            workbook.xlsx.readFile(job.data.filepath)
            .then(async () => {
                var worksheet = workbook.getWorksheet(job.data.sheetName);
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
                            case 'GMSSTPA':
                                for (i=0; i<=11; i++){
                                    GMSSTPA[i] = GMSSTPA[i] + inputRow[9+i];
                                }
                                break;
                        }
                    }
                    inputRow = [];
                });
                await authorizedBudget.create({createdBy: job.data.user, createdAt: Date.now(),
                    authNumber: job.data.authNumber, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
                done();
            }).catch( (err) => {
                console.log(err);
            });
        } catch (err) {
            console.log(err);
        }
        job.progress(100);
    });

    const exerQueue = new Queue('Exercised', REDIS_URL);
    exerQueue.process(maxJobsPerWorker, async (job, done) => {
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
            workbook.xlsx.readFile(job.data.filepath)
            .then(async () => {
                var worksheet = workbook.getWorksheet(job.data.sheetName);
                worksheet.eachRow((row,rowNumber) => {
                    if (rowNumber !== 1){
                        row.eachCell((cell, colNumber) => {
                            if (colNumber === 3) {
                                if (Number.parseInt(cell.value,[ 10 ]) !== job.data.inputYear) {
                                    done (new Error('Some rows contain a year that doesn\'t match the input parameters'));
                                }
                            } else if (colNumber === 11) {
                                if (Number.parseInt(cell.value,[ 10 ]) !== job.data.inputMonth) {
                                    done (new Error('Some rows contain a month that doesn\'t match the input parameters'));
                                }
                            }
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
                await exercisedBudget.create({createdBy: job.data.user, createdAt: Date.now(),
                    exerciseDate: job.data.inputDate, AA, CGDUOS, GMDE, GMGE, GMM, GMOPI, CSTPIP, GSMCCIT, GSSLT, GMSSTPA});
                done();
            }).catch((err) => {
                console.log(err);
            });
        }
        catch (err) {
            console.log(err);
        }
        job.progress(100);
    });

}

// Initialize the clustered worker process
throng({ workers, start });
