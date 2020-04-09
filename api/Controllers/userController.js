const User = require('../Models/userModel');
const AppError = require('../Helpers/appError');

exports.userDetail = async (req, res, next) => {
    try {
        if (req.params.id !== req.user) {
            return next(new AppError(403, 'Forbidden', 'You can\'t see other\'s people profile'), req, res, next);
        }
        const user = await User.findById(req.user);
        user.password = undefined;
        res.status(200).json({
            status: 'Success',
            data: {
                user
            }
        });
    } catch (err) {
        return next(err);
    }
};
