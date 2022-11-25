const express = require('express');
const app = express();
const cors = require('cors');
const moragan = require("morgan")
const rateLimit = require("express-rate-limit")
const bodyParser = require("body-parser")

//Import routes
const globalErrorHandler = require("./controllers/error.controller")
const tourRoute = require("./routes/tours.routes");
const AppError = require('./utils/appError');
const authRoute = require("./routes/auth.routes")
const reviewRoute = require("./routes/review.routes")
const bookingRoute = require("./routes/booking.routes");
const { webhookCheckout } = require('./controllers/booking.controller');


app.use(express.json());
app.use(cors());
app.use(moragan("dev"))
app.use(express.urlencoded({ extended: true }));

// const limit = rateLimit({
//     max: 100000,
//     windowMs: 60 * 60 * 1000,
//     message: "Too many request from this api"
// })
// app.use("/api", limit)


app.post(
    '/webhook-checkout',
    bodyParser.raw({ type: 'application/json' }),
    webhookCheckout
);


// Routes 
app.get("/", (req, res) => {
    res.send("Hello")
})
app.use("/api/v1/tours", tourRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/reviews", reviewRoute)
app.use("/api/v1/booking", bookingRoute)


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler)

module.exports = app

