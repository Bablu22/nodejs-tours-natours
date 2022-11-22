const { isAuthenticated } = require("../controllers/auth.controller");
const { getCheckoutSession } = require("../controllers/booking.controller");

const router = require("express").Router();

router.post("/checkout-session/:tourId", isAuthenticated, getCheckoutSession);

module.exports = router;
