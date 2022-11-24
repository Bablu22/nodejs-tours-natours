const router = require("express").Router();
const {
  isAuthenticated,
  protectTo,
} = require("../controllers/auth.controller");
const { createReview, getReview } = require("../controllers/review.controller");
const {
  createTour,
  getTours,
  getTourStats,
  getMonthlyPlan,
  getTour,
  updateTour,
  deleteTour,
} = require("../controllers/tours.controller");
const { topTourAlice } = require("../middlewares/topTour");

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/top-5-cheap").get(topTourAlice, getTours);

router
  .route("/")
  .post(isAuthenticated, protectTo("admin"), createTour)
  .get(getTours);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

router.route("/:tourId/reviews").post(isAuthenticated, createReview);
router.route("/:tourId/reviews").get(isAuthenticated, getReview);

module.exports = router;
