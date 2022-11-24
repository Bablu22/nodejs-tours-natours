const router = require("express").Router();
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    isAuthenticated,
    updateMe,
    deleteMe,
    getAllUser,
    getMe,
    getMeMiddleWare,
    updateUser,
    protectTo,
    getinActiveUser
} = require("../controllers/auth.controller");

router.route('/users').get(isAuthenticated, getAllUser)
router.route('/users-inactive').get(isAuthenticated, protectTo('admin'), getinActiveUser)
router.route('/user').get(isAuthenticated, getMeMiddleWare, getMe)

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/update-password").patch(isAuthenticated, updatePassword);
router.route("/updateme").patch(isAuthenticated, updateMe);
router.route("/deleteme").delete(isAuthenticated, deleteMe);

router.route("/update-user").patch(isAuthenticated, protectTo("admin"), updateUser)

// router.route("/forgot-password").post(forgotPassword)
// router.route("/reset-password/:token").post(resetPassword)

module.exports = router;
