const { isAuthenticated } = require("../controllers/auth.controller");
const { getCheckoutSession } = require("../controllers/booking.controller");

const router = require("express").Router();

router.get("/checkout-session/:tourId", isAuthenticated, getCheckoutSession);

router.route("/").post(isAuthenticated,create)
module.exports = router;

