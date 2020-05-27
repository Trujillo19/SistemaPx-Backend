const User = require('../Models/userModel');
const AppError = require('../Helpers/appError');

// User Detail Controller
exports.userDetail = async (req, res, next) => {
    try {
        // Ig the User ID isn't the login user, don't show it.
        if (req.params.id !== req.user) {
            return next(new AppError(403, 'Forbidden', 'No puedes ver el perfil de otra persona.'), req, res, next);
        }
        // Busca el usuario por ID.
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
