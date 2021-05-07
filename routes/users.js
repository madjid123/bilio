// importing modules
const express = require("express"),
    router = express.Router(),
    middleware = require("../middleware");

// importing controller
const userController = require('../controllers/user');

// user -> dashboard
router.get("/user/:page", middleware.isLoggedIn, userController.getUserDashboard);

// user -> profile
router.get("/user/:page/profile", middleware.isLoggedIn, userController.getUserProfile);

//user -> upload image
router.post("/user/1/image", middleware.isLoggedIn, userController.postUploadUserImage);

//user -> update password
router.put("/user/1/update-password", middleware.isLoggedIn, userController.putUpdatePassword);

//user -> update profile
router.put("/user/1/update-profile", middleware.isLoggedIn, userController.putUpdateUserProfile);

//user -> notification
router.get("/user/1/notification", middleware.isLoggedIn, userController.getNotification);

//user -> issue a document
router.post("/documents/:document_id/issue/:user_id", middleware.isLoggedIn, userController.postIssueDocument);

//user -> show return-renew page
router.get("/documents/return-renew", middleware.isLoggedIn, userController.getShowRenewReturn);

//user -> renew document
router.post("/documents/:document_id/renew", middleware.isLoggedIn, middleware.isLoggedIn, userController.postRenewDocument);

// user -> return document

router.post("/documents/:document_id/return", middleware.isLoggedIn, userController.postReturnDocument);

//user -> create new comment
router.post("/documents/details/:document_id/comment", middleware.isLoggedIn, userController.postNewComment);

//user -> update existing comment
router.post("/documents/details/:document_id/:comment_id", middleware.isLoggedIn, userController.postUpdateComment);

//user -> delete existing comment
router.delete("/documents/details/:document_id/:comment_id", middleware.isLoggedIn, userController.deleteComment);

// user -> delete user account
router.delete("/user/1/delete-profile", middleware.isLoggedIn, userController.deleteUserAccount);

module.exports = router;