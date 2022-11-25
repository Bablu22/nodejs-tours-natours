const { isAuthenticated } = require("../controllers/auth.controller");
const {
    createBooking,
    getAllBooking,
    getUsersBooking,
} = require("../controllers/booking.controller");

const router = require("express").Router();

router
    .route("/")
    .post(isAuthenticated, createBooking)
    .get(isAuthenticated, getAllBooking);

router.route("/:id").get(isAuthenticated, getUsersBooking);

module.exports = router;
