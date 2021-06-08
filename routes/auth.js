const express = require("express"),
    router = express.Router(),
    middleware = require("../middleware"),
    passport = require('passport');


// Import index controller
const authController = require('../controllers/auth');

// Import models
const User = require("../models/user");

//landing page
router.get('/', authController.getLandingPage);

//admin login handler
router.get("/auth/admin-login", authController.getAdminLoginPage)

router.post("/auth/admin-login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/auth/admin-login",
}), (req, res) => {
});

//admin logout handler
router.get("/auth/admin-logout", authController.getAdminLogout);


// admin sign up handler
router.get("/auth/admin-signup",middleware.estNonConnecte, authController.getAdminSignUp);

router.post("/auth/admin-signup", authController.postAdminSignUp);

//user login handler
router.get("/auth/user-login", middleware.estNonConnecte, authController.getUserLoginPage);

router.post("/auth/user-login", passport.authenticate("local", 
{
    failureRedirect : "/auth/user-login",
    failureFlash : "Username ou mot de passe non valide"
}),async  (req, res) => {
    
     let url = (req.isAuthenticated() && req.user.type ==='lecteur')? "/user/1": "/admin";
     console.log(url)
     res.redirect(url)
});

//user -> user logout handler
router.get("/auth/user-logout", authController.getUserLogout);

//user sign up handler
router.get("/auth/user-signUp",  authController.getUserSignUp);

router.post("/auth/user-signup",  authController.postUserSignUp);

//admin -> profile
module.exports = router;