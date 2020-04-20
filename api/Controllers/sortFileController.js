var Excel = require('exceljs');
var sorter = require('../Helpers/sortExercise');
const AppError = require('../Helpers/appError');


exports.sort = async (req, res, next) => {
    var sliceName = req.file.originalname.slice(0,-5);
    var int = parseInt((Math.random() * 100), 10);
    outputDirectory = '/Users/angeltrujillo/backend/downloads/'+sliceName+'-clasificado'+int+'.xlsx';
    console.log(outputDirectory);
    var options = {
        filename: outputDirectory,
        useStyles: true,
        useSharedStrings: true
    };
    var outputWorbook =  new Excel.stream.xlsx.WorkbookWriter(options);
    var outputWorksheet = outputWorbook.addWorksheet('Base Clasificada');
    var sheetName = req.body.sheetName;
    var centroGestor = req.body.centroGestor;
    var posicionPresupuestal = req.body.posicionPresupuestal;
    var posicionFinanciera = req.body.posicionFinanciera;
    var contrato = req.body.contrato;
    var inputRow = [];
    try {
        if (!req.file || !req.body.sheetName || ! req.body.centroGestor || !req.body.posicionPresupuestal
            || !req.body.posicionFinanciera) {
            return next(new AppError(400, 'Bad Request', 'File or parameters are not present'));
        }
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(req.file.path)
        .then(async () => {
            var worksheet = workbook.getWorksheet(sheetName);
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    row.eachCell((cell, colNumber) => {
                        inputRow.push(cell.value);
                    });
                    var resultado = sorter.generalSort(inputRow, centroGestor,
                        posicionFinanciera, posicionPresupuestal, contrato);
                    outputWorksheet.addRow(resultado).commit();
                    inputRow = [];
                }
            });
            outputWorksheet.commit();
            outputWorbook.commit();
        })
        .catch( (err) => {
            console.log(err);
        })
        .finally ( () => {
            console.log('Downloading...');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.sendFile(outputDirectory);
        });
    } catch (err) {
        console.log(err);
    }
};
