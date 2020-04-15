var Excel = require('exceljs');
var sorter = require('../Helpers/sortExercise');
const exercisedBudget = require('../Models/exercisedBudgetModel');
const AppError = require('../Helpers/appError');

var GM_clasificado = [];
var Subdireccion_clasificado = [];
var Importe_clasificado = [];
var Ledger_clasificado = [];
var EntidadCp_clasificado = [];
var ano_clasificado= [];
var tipoDeVa_clasificado= [];
var elemetoPep_clasificado = [];
var fondo_clasificado = [];
var centroGestor_clasificado = [];
var PosPresu_clasificado = [];
var programaPres_clasificado = [];
var monedaDoc_clasificado = [];
var periodoFm_clasificado = [];
var doctoPre_clasificado = [];
var posDocPr_clasificado = [];
var docFl_clasificado = [];
var contrato_clasificado = [];
var acreedor_clasificado = [];
var nombreAcreedor_clasificado = [];
var textoCabecera_clasificado = [];
var referencia_clasificado = [];
var socFi_clasificado = [];
var anoDocFi_clasificado = [];
var textoPosicion_clasificado = [];
var fechaCont_clasificado = [];
var importeFm_clasificado = [];
var importeDo_clasificado = [];
var fActCp_clasificado = [];

exports.createExercised = async (req, res, next) => {
    const colCentroGestor = 6;
    const colPosicionFinanciera = 7;
    const colPosicionPresupuestal = 8;
    const colContrato = 14;
    const colImporte = 23;
    var inputRow = [];
    const inputDate = new Date(req.body.inputDate);
    var inputYear = inputDate.getFullYear();
    var inputMonth = inputDate.getMonth()+1;
    try {
        // Quick exit. If a file or parameters isn't present, send a Bad Request.
        if (!req.file || !req.body.inputDate) {
            return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
        }
        console.log(req.file.path);
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(req.file.path)
        .then(async () => {
            var worksheet = workbook.getWorksheet('Hoja1');
            worksheet.eachRow((row,rowNumber) => {
                if (rowNumber !== 1){
                    row.eachCell((cell, colNumber) => {
                        // Month and Year Verification. Any other verification should take place here.
                        if (colNumber === 3) {
                            if (Number.parseInt(cell.value,[ 10 ]) !== inputYear) {
                                return next(new AppError(400, 'Bad Request', 'Some rows contain a year that doesn\'t match the input parameters'));
                            }
                        } else if (colNumber === 11) {
                            if (Number.parseInt(cell.value,[ 10 ]) !== inputMonth) {
                                return next(new AppError(400, 'Bad Request', 'Some rows contain a month that doesn\'t match the input parameters'));
                            }
                        }
                        inputRow.push(cell.value);
                    });
                    var outputRow = sorter.sort(inputRow,colCentroGestor,colPosicionFinanciera,
                         colPosicionPresupuestal,colContrato,colImporte);
                    // This isn't an elegant solution, but it's the one that worked. Try to improve later.
                    if (outputRow !== undefined) {
                        if (outputRow[0] !== 'GERENCIA' && outputRow[0] !== 'NO ASIG') {
                            GM_clasificado.push(outputRow[0]);
                            Subdireccion_clasificado.push(outputRow[1]);
                            Importe_clasificado.push(outputRow[2]);
                            Ledger_clasificado.push(outputRow[3]);
                            EntidadCp_clasificado.push(outputRow[4]);
                            ano_clasificado.push(outputRow[5]);
                            tipoDeVa_clasificado.push(outputRow[6]);
                            elemetoPep_clasificado.push(outputRow[7]);
                            fondo_clasificado.push(outputRow[8]);
                            centroGestor_clasificado.push(outputRow[9]);
                            PosPresu_clasificado.push(outputRow[10]);
                            programaPres_clasificado.push(outputRow[11]);
                            monedaDoc_clasificado.push(outputRow[12]);
                            periodoFm_clasificado.push(outputRow[13]);
                            doctoPre_clasificado.push(outputRow[14]);
                            posDocPr_clasificado.push(outputRow[15]);
                            docFl_clasificado.push(outputRow[16]);
                            contrato_clasificado.push(outputRow[17]);
                            acreedor_clasificado.push(outputRow[18]);
                            nombreAcreedor_clasificado.push(outputRow[19]);
                            textoCabecera_clasificado.push(outputRow[20]);
                            referencia_clasificado.push(outputRow[21]);
                            socFi_clasificado.push(outputRow[22]);
                            anoDocFi_clasificado.push(outputRow[23]);
                            textoPosicion_clasificado.push(outputRow[24]);
                            fechaCont_clasificado.push(outputRow[25]);
                            importeFm_clasificado.push(outputRow[26]);
                            importeDo_clasificado.push(outputRow[27]);
                            fActCp_clasificado.push(outputRow[28]);
                        }
                    }
                    inputRow = [];
                }
            });
            var exerciseCount = await exercisedBudget.countDocuments({ exerciseDate: inputDate });
            if (exerciseCount <= 0) {
                var exerciseOne = await exercisedBudget.create({createdBy: req.user, createdAt: Date.now(), exerciseDate: inputDate, gm: GM_clasificado, subdireccion: Subdireccion_clasificado,
                    importe: Importe_clasificado, ledger: Ledger_clasificado, entidadCp: EntidadCp_clasificado, ano: ano_clasificado,
                    tipodeVa: tipoDeVa_clasificado, elementoPep: elemetoPep_clasificado, fondo: fondo_clasificado, centroGestor: centroGestor_clasificado,
                    posicionPresupuestal: PosPresu_clasificado, programaPresupuestal: programaPres_clasificado, moneda: monedaDoc_clasificado,
                    periodoFm: periodoFm_clasificado, doctoPre: doctoPre_clasificado, posDocPr: posDocPr_clasificado, docFl: docFl_clasificado,
                    contrato: contrato_clasificado, acreedor: acreedor_clasificado, nombreAcreedor: nombreAcreedor_clasificado, textoCabecera: textoCabecera_clasificado,
                    referencia: referencia_clasificado, socFl: socFi_clasificado, anoDocFl: anoDocFi_clasificado, textoDePosicion: textoPosicion_clasificado,
                    fechaCont: fechaCont_clasificado, importeFm: importeFm_clasificado, importeDo: importeDo_clasificado, fActCp: fActCp_clasificado});
                res.status(201).json({
                    status: 'Created',
                    data: {
                        exercise: exerciseOne
                    }
                });
            }
            else {
                // I'm not sure if this async functions will cause trubble latter, for now it works.
                // TODO: Change this to FindOneAndReplace.
                await exercisedBudget.deleteOne({exerciseDate: inputDate});
                var exerciseMany = await ExercisedBudget.create({createdBy: req.user, createdAt: Date.now(), exerciseDate: inputDate, gm: GM_clasificado, subdireccion: Subdireccion_clasificado,
                    importe: Importe_clasificado, ledger: Ledger_clasificado, entidadCp: EntidadCp_clasificado, ano: ano_clasificado,
                    tipodeVa: tipoDeVa_clasificado, elementoPep: elemetoPep_clasificado, fondo: fondo_clasificado, centroGestor: centroGestor_clasificado,
                    posicionPresupuestal: PosPresu_clasificado, programaPresupuestal: programaPres_clasificado, moneda: monedaDoc_clasificado,
                    periodoFm: periodoFm_clasificado, doctoPre: doctoPre_clasificado, posDocPr: posDocPr_clasificado, docFl: docFl_clasificado,
                    contrato: contrato_clasificado, acreedor: acreedor_clasificado, nombreAcreedor: nombreAcreedor_clasificado, textoCabecera: textoCabecera_clasificado,
                    referencia: referencia_clasificado, socFl: socFi_clasificado, anoDocFl: anoDocFi_clasificado, textoDePosicion: textoPosicion_clasificado,
                    fechaCont: fechaCont_clasificado, importeFm: importeFm_clasificado, importeDo: importeDo_clasificado, fActCp: fActCp_clasificado});
                res.status(201).json({
                    status: 'Created and deleted older documents',
                    data: {
                        exercise: exerciseMany
                    }
                });
            }
        }).catch(() => {
            return next(new AppError(500, 'Server error', 'Something isn\'t rigth with the Excel File Reader.'));
        }).finally(() =>{
            GM_clasificado = [];
            Subdireccion_clasificado = [];
            Importe_clasificado= [];
            Ledger_clasificado= [];
            EntidadCp_clasificado= [];
            ano_clasificado= [];
            tipoDeVa_clasificado= [];
            elemetoPep_clasificado= [];
            fondo_clasificado= [];
            centroGestor_clasificado= [];
            PosPresu_clasificado= [];
            programaPres_clasificado= [];
            monedaDoc_clasificado= [];
            periodoFm_clasificado= [];
            doctoPre_clasificado= [];
            posDocPr_clasificado= [];
            docFl_clasificado= [];
            contrato_clasificado= [];
            acreedor_clasificado= [];
            nombreAcreedor_clasificado= [];
            textoCabecera_clasificado= [];
            referencia_clasificado= [];
            socFi_clasificado= [];
            anoDocFi_clasificado= [];
            textoPosicion_clasificado= [];
            fechaCont_clasificado= [];
            importeFm_clasificado= [];
            importeDo_clasificado= [];
            fActCp_clasificado= [];
        });
    } catch (err) {
        next(err);
    }
};


exports.getExercised = async (req, res, next) => {
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
    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);
    try {
        if (endDate - startDate < 0 ) {
            return next(new AppError(400, 'Bad Request', 'Start date must be earlier than end date'));
        }
        else if (endDate - startDate >= 0) {
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
                AA[i] = 0;
                CGDUOS[i] = 0;
                GMDE[i] = 0;
                GMGE[i] = 0;
                GMM[i] = 0;
                GMOPI[i] = 0;
                CSTPIP[i] = 0;
                GSMCCIT[i] = 0;
                GSSLT[i] = 0;
                GMSSTPA[i] = 0;
                var rowLength = document[i][0].length;
                for (var j = 0; j<=rowLength-1; j++){
                    switch (document[i][0][j]) {
                        case 'AA':
                            AA[i] = AA[i] + document[i][2][j];
                            break;
                        case 'CGDUOS':
                            CGDUOS[i] = CGDUOS[i] + document[i][2][j];
                            break;
                        case 'GMDE':
                            GMDE[i] = GMDE[i] + document[i][2][j];
                            break;
                        case 'GMGE':
                            GMGE[i] = GMGE[i] + document[i][2][j];
                            break;
                        case 'GMM':
                            GMM[i] = GMM[i] + document[i][2][j];
                            break;
                        case 'GMOPI':
                            GMOPI[i] = GMOPI[i] + document[i][2][j];
                            break;
                        case 'CSTPIP':
                            CSTPIP[i] = CSTPIP[i] + document[i][2][j];
                            break;
                        case 'GSMCCIT':
                            GSMCCIT[i] = GSMCCIT[i] + document[i][2][j];
                            break;
                        case 'GSSLT':
                            GSSLT[i] = GSSLT[i] + document[i][2][j];
                            break;
                        case 'GMSSTPA':
                            GMSSTPA[i] = GSSLT[i] + document[i][2][j];
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

        }}
    catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getDetailView = async (req, res, next) => {
    var GM = req.params.GM;
    try {
        var detailExercise = await exercisedBudget.find({ gm: GM});
        if (detailExercise.length === 0) {
            return next(new AppError(404, 'Not found', 'No data found'));
        }
        res.status(200).json({
            status: 'Success',
            data: {
                exercise: detailExercise
            }
        });
    }
    catch (err){
        console.log(err);
        next(err);
    }
};
