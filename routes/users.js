// importing modules
const express = require("express"),
    router = express.Router(),
    middleware = require("../middleware");

// importing controller
const userController = require('../controllers/user');

// user -> dashboard
router.get("/user/:page", middleware.estConnecte, userController.getUserDashboard);

// user -> profile
router.get("/user/:page/profile", middleware.estConnecte, userController.getUserProfile);

//user -> upload image
router.post("/user/1/image", middleware.estConnecte, userController.postUploadUserImage);

//user -> update password
router.put("/user/1/update-password", middleware.estConnecte, userController.putUpdatePassword);

//user -> update profile
router.put("/user/1/update-profile", middleware.estConnecte, userController.putUpdateUserProfile);

//user -> notification
router.get("/user/1/notification", middleware.estConnecte, userController.getNotification);

//user -> pret a document
router.post("/documents/:document_id/pret/:user_id", middleware.estConnecte, userController.postpretDocument);

//user -> show MesPrets page
router.get("/documents/MesPrets", middleware.estConnecte, userController.getShowRenewReturn);


// user -> delete user account
router.delete("/user/1/delete-profile", middleware.estConnecte, userController.deleteUserAccount);

module.exports = router;