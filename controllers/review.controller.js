const { StatusCodes } = require("http-status-codes");
const Review = require("../models/ReviewModel");

exports.createReview = async (req, res, next) => {
    try {
        if (!req.body.tour) req.body.tour = req.params.tourId;
        if (!req.body.user) req.body.user = req.user.id;
        const newReview = await Review.create(req.body);
        res
            .status(StatusCodes.CREATED)
            .json({ status: "Success", message: "Review submit success", newReview });
    } catch (error) {
        next(error);
    }
};

exports.getReview = async (req, res, next) => {
    try {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const reviews = await Review.find(filter);
        res.status(StatusCodes.OK).json({ status: "Success", reviews });
    } catch (error) {
        next(error);
    }
};
