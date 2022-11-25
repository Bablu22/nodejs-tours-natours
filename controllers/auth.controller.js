const { StatusCodes } = require("http-status-codes");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const sendEmail = require("../utils/email");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME,
    });
};

exports.signUp = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        const currentUser = await User.findOne({ email });

        if (currentUser) {
            return next(
                new AppError("This email is already used", StatusCodes.BAD_REQUEST)
            );
        }

        const user = await User.create({
            name,
            email,
            password,
            confirmPassword,
        });
        const token = signToken(user._id);

        // Remove password from output
        user.password = undefined;

        res.status(StatusCodes.CREATED).json({
            status: "success",
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check if email and password exist
        if (!email || !password) {
            return next(
                new AppError("Please provide your credentials", StatusCodes.BAD_REQUEST)
            );
        }
        // Check if user is exist and password is match
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new AppError("User not found", StatusCodes.NOT_FOUND));
        }
        const passCorrect = await user.correctPassword(password, user.password);
        if (!passCorrect) {
            return next(
                new AppError("Email or password is invalid", StatusCodes.UNAUTHORIZED)
            );
        }

        // If everythin is ok then send a token
        const token = signToken(user._id);

        // Remove password from output
        user.password = undefined;
        res.status(StatusCodes.CREATED).json({
            status: "success",
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.isAuthenticated = async (req, res, next) => {
    // 1. Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new AppError(
                "You are not not logged in, Please log in first",
                StatusCodes.UNAUTHORIZED
            )
        );
    }
    // 2. Verify token and check user is use is exist ?
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3. Again check if user is exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError(
                "The user beloging this token does no longer exist",
                StatusCodes.UNAUTHORIZED
            )
        );
    }
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("User recently changed password! Please log in again.", 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
};

exports.protectTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You dont have permission to access this action.",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        next();
    };
};

exports.updatePassword = async (req, res, next) => {
    try {
        // 1) Get user from collection
        const user = await User.findById(req.user.id).select("+password");

        // 2) Check if POSTed current password is correct
        if (
            !(await user.correctPassword(req.body.passwordCurrent, user.password))
        ) {
            return next(new AppError("Your current password is wrong.", 401));
        }

        // 3) If so, update password
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();
        // User.findByIdAndUpdate will NOT work as intended!

        // 4) Log user in, send JWT
        const token = signToken(user._id);

        // Remove password from output
        user.password = undefined;
        res.status(StatusCodes.CREATED).json({
            status: "success",
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.confirmPassword) {
            return next(
                new AppError(
                    "This route is not for password updates. Please use /updateMyPassword.",
                    400
                )
            );
        }

        const filterObj = (obj, ...allowedFields) => {
            const newObj = {};
            Object.keys(obj).forEach((el) => {
                if (allowedFields.includes(el)) newObj[el] = obj[el];
            });
            return newObj;
        };

        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = filterObj(req.body, "name", "email", "photo");

        // 3) Update user document
        const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: false,
        });

        res.status(200).json({
            status: "success",
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const filterObj = (obj, ...allowedFields) => {
            const newObj = {};
            Object.keys(obj).forEach((el) => {
                if (allowedFields.includes(el)) newObj[el] = obj[el];
            });
            return newObj;
        };

        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = filterObj(req.body, "role", "active");

        // 3) Update user document
        const user = await User.findByIdAndUpdate(req.body.id, filteredBody, {
            new: true,
            runValidators: false,
        });

        res.status(200).json({
            status: "success",
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { active: false });

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllUser = async (req, res, next) => {
    try {
        const users = await User.find({ active: true });
        res.status(200).json({
            status: "success",
            users,
        });
    } catch (error) {
        next(error);
    }
};

exports.getinActiveUser = async (req, res, next) => {
    try {
        const users = await User.find({ active: false });
        res.status(200).json({
            status: "success",
            users,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMeMiddleWare = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getMe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (error) {
        next(error);
    }
};

exports.makeAdmin = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { $set: { role: role } }
        );
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (error) {
        next(error);
    }
};

/* 


exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        // 1. Get user based on email
        const user = await User.findOne({ email });
        if (!user) {
            return next(
                new AppError("There is no user with this email", StatusCodes.NOT_FOUND)
            );
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/resetPassword/${resetToken}`;

        const message = `Forgot password reset email: ${resetURL}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset token",
                message,
            });
            res.status(200).json({
                status: "success",
                message: "Token sent to email!",
            });
        } catch (error) {
            console.log(error);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({
                validateBeforeSave: false,
            });
            return next(
                new AppError(
                    "There was an error sending the email",
                    StatusCodes.BAD_REQUEST
                )
            );
        }
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
    } catch (error) {
        next(error);
    }
};


*/
