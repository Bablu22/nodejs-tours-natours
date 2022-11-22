const { StatusCodes } = require("http-status-codes");
const Tour = require("../models/TourModel");
const AppError = require("../utils/appError");

exports.createTour = async (req, res, next) => {
    try {
        const tour = await Tour.create(req.body);
        res
            .status(StatusCodes.CREATED)
            .json({ status: "Success", message: "Tour created success", tour });
    } catch (error) {
        next(error);
    }
};

exports.getTours = async (req, res, next) => {
    try {
        // 1. Filtering
        const queryObj = { ...req.query };
        const excludeFeild = ["page", "limit", "sort", "fields"];
        excludeFeild.forEach((el) => delete queryObj[el]);

        // Advance filtering
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );

        let query = Tour.find(JSON.parse(queryString));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }
        // Field limitation
        if (req.query.fields) {
            const sortBy = req.query.fields.split(",").join(" ");
            query = query.select(sortBy);
        } else {
            query = query.select("-_v");
        }

        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error("This page does not exist");
        }

        const tours = await query;
        const result = tours.length;
        res.status(StatusCodes.OK).json({ status: "Success", result, tours });
    } catch (error) {
        next(error);
    }
};

exports.getTourStats = async (req, res, next) => {
    try {
        const stats = await Tour.aggregate([
            { $match: { ratingsAverage: { $gte: 4.5 } } },
            {
                $group: {
                    _id: { $toUpper: "$difficulty" },
                    numTours: { $sum: 1 },
                    numRating: { $sum: "ratingsAverage" },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                    tours: { $push: "$name" },
                },
            },
            {
                $sort: { avgPrice: 1 },
            },
        ])

        res.status(StatusCodes.OK).json({ status: "Success", stats });
    } catch (error) {
        next(error);
    }
};

exports.getMonthlyPlan = async (req, res, next) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates",
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: "$startDates" },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: "$name" },
                },
            },
            {
                $addFields: { month: "$_id" },
            },
            {
                $project: { _id: 0 },
            },
            {
                $sort: { numTourStarts: -1 },
            },
        ]);

        res.status(StatusCodes.OK).json({ status: "Success", plan });
    } catch (error) {
        next(error);
    }
};

exports.getTour = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findById(id).populate("guides").populate('reviews')
        if (!tour) {
            return next(new AppError("No tour found with that id", 404));
        }
        res.status(StatusCodes.OK).json({ status: "Success", tour });
    } catch (error) {
        next(error);
    }
};


exports.updateTour = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!tour) {
            return next(new AppError("No tour found with that id", 404));
        }
        res.status(StatusCodes.OK).json({ status: "Update success", tour });
    } catch (error) {
        next(error);
    }
};

exports.deleteTour = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tour = await Tour.findByIdAndDelete(id);
        if (!tour) {
            return next(new AppError("No tour found with that id", 404));
        }
        res.status(StatusCodes.OK).json({ status: "Delete success" });
    } catch (error) {
        next(error);
    }
};


