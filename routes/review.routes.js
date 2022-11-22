const {
    isAuthenticated,
    protectTo,
} = require("../controllers/auth.controller");
const { createReview, getReview } = require("../controllers/review.controller");

const router = require("express").Router();

router.route("/").get(getReview);


module.exports = router;
