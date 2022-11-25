const { isAuthenticated } = require("../controllers/auth.controller");
const {
    createBooking,
    getAllBooking,
    getUsersBooking,
    deleteBooking,
} = require("../controllers/booking.controller");

const router = require("express").Router();

router
    .route("/")
    .post(isAuthenticated, createBooking)
    .get(isAuthenticated, getAllBooking);

router.route("/:id").get(isAuthenticated, getUsersBooking);
router.route("/:id").delete(isAuthenticated, deleteBooking);

module.exports = router;
