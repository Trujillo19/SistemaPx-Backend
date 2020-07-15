const AppError = require('../Helpers/appError');
const aws = require('aws-sdk');

exports.uploadProfilePicture = async (req, res, next) => {
    const s3 = new aws.S3();
    const fileName = req.query.filename;
    const fileType = req.query.filetype;
    const user = req.user;

    aws.config.region = 'us-east-1';
    const S3_BUCKET = process.env.S3_BUCKET;

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            return next(new AppError(400, 'Bad Request', 'No se pudo firmar'));
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${user}-${fileName}`
        };
        res.status(200).json(returnData);
    });
};
