const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    // fs = require("fs"),
    // path = require("path"),
    middleware = require("../middleware"),
    User = require("../models/user"),
    Document = require("../models/document"),
    Activity = require("../models/activity"),
    Issue = require("../models/issue"),
    Comment = require("../models/comment");

// importing controller
const adminController = require('../controllers/admin');

//admin -> dashboard
router.get("/admin", middleware.isAdmin, adminController.getDashboard);

//admin -> find activities of all users on admin dashboard
router.post("/admin", middleware.isAdmin, adminController.postDashboard);

//admin -> delete profile
router.delete("/admin/delete-profile", middleware.isAdmin, adminController.deleteAdminProfile);

//admin document inventory
router.get("/admin/documentInventory/:filter/:value/:page", middleware.isAdmin, adminController.getAdminDocumentInventory);
//admin -> show document copies
router.get("/admin/document/:doc_id/copies", middleware.isAdmin, adminController.getDocumentCopies)
// admin -> show searched documents
router.post("/admin/documentInventory/:filter/:value/:page", middleware.isAdmin, adminController.postAdminDocumentInventory);

//admin -> show documents to be updated
router.get("/admin/document/update/:document_id", middleware.isAdmin, adminController.getUpdateDocument);

//admin -> update document
router.post("/admin/document/update/:document_id", middleware.isAdmin, adminController.postUpdateDocument);

//admin -> delete document
router.get("/admin/document/delete/:document_id", middleware.isAdmin, adminController.getDeleteDocument);

//admin -> users list 
router.get("/admin/users/:page", middleware.isAdmin, adminController.getUserList);

//admin -> show searched user
router.post("/admin/users/:page", middleware.isAdmin, adminController.postShowSearchedUser);

//admin -> flag/unflag user
router.get("/admin/users/flagged/:user_id", middleware.isAdmin, adminController.getFlagUser);

//admin -> show one user
router.get("/admin/users/profile/:user_id", middleware.isAdmin, adminController.getUserProfile);

//admin -> show all activities of one user
router.get("/admin/users/activities/:user_id", middleware.isAdmin, adminController.getUserAllActivities);

//admin -> show activities by categorie
router.post("/admin/users/activities/:user_id", middleware.isAdmin, adminController.postShowActivitiesByCategory);

// admin -> delete a user
router.get("/admin/users/delete/:user_id", middleware.isAdmin, adminController.getDeleteUser);

//admin -> add new document
router.get("/admin/documents/add", middleware.isAdmin, adminController.getAddNewDocument);
router.post("/admin/documents/add", middleware.isAdmin, adminController.postAddNewDocument)

router.post("/admin/documents/add", middleware.isAdmin, adminController.postAddNewDocument);
//admin -> add new copy
router.get("/admin/document/:doc_id/copies/add", middleware.isAdmin, adminController.getAddCopyDocument);
router.post("/admin/document/:doc_id/copies/add", middleware.isAdmin, adminController.postAddCopyDocument);
//admin -> update document copy
router.get("/admin/document/:doc_id/copies/update/:copy_id", middleware.isAdmin, adminController.getUpdateCopyDocument)
router.post("/admin/document/:doc_id/copies/update/:copy_id", middleware.isAdmin, adminController.postUpdateCopyDocument)

//admin -> delete document copy 
router.get('/admin/document/:doc_id/copies/delete/:copy_id', middleware.isAdmin, adminController.deleteCopyDocument)
//admin -> register user

//admin -> update profile
router.post("/admin/profile", middleware.isAdmin, adminController.postUpdateAdminProfile);

//admin -> update password
router.put("/admin/update-password", middleware.isAdmin, adminController.putUpdateAdminPassword);

// //admin -> notifications
// router.get("/admin/notifications", (req, res) => {
//    res.send("This route is still under development. will be added in next version");
// });

module.exports = router;