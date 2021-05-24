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
router.get("/admin", middleware.isAdmin, adminController.dashboard.getDashboard);

//admin -> find activities of all users on admin dashboard
router.post("/admin", middleware.isAdmin, adminController.dashboard.postDashboard);



//admin document inventory
router.get("/admin/documentInventory/:filter/:value/:page", middleware.isAdmin, adminController.documents.getAdminDocumentInventory);
//admin -> show document copies
router.get("/admin/document/:doc_id/copies", middleware.isAdmin, adminController.documents.getDocumentCopies)
// admin -> show searched documents
router.post("/admin/documentInventory/:filter/:value/:page", middleware.isAdmin, adminController.documents.postAdminDocumentInventory);

//admin -> show documents to be updated
router.get("/admin/document/update/:document_id", middleware.isAdmin, adminController.document.getUpdateDocument);

//admin -> update document
router.post("/admin/document/update/:document_id", middleware.isAdmin, adminController.document.postUpdateDocument);

//admin -> delete document
router.get("/admin/document/delete/:document_id", middleware.isAdmin, adminController.document.getDeleteDocument);

//admin -> users list 
router.get("/admin/users/:page", middleware.isAdmin, adminController.users.getUserList);

//admin -> show searched user
router.post("/admin/users/:page", middleware.isAdmin, adminController.users.postShowSearchedUser);

//admin -> flag/unflag user
router.post("/admin/users/flagged/:user_id", middleware.isAdmin, adminController.users.postFlagUser);

//admin -> show one user
router.get("/admin/users/profile/:user_id", middleware.isAdmin, adminController.users.getUserProfile);

//admin -> show all activities of one user
router.get("/admin/users/activities/:user_id", middleware.isAdmin, adminController.users.getUserAllActivities);

//admin -> show activities by categorie
router.post("/admin/users/activities/:user_id", middleware.isAdmin, adminController.users.postShowActivitiesByCategory);

// admin -> delete a user
router.get("/admin/users/delete/:user_id", middleware.isAdmin, adminController.users.getDeleteUser);

//admin -> add new document
router.get("/admin/documents/add", middleware.isAdmin, adminController.document.getAddNewDocument);
router.post("/admin/documents/add", middleware.isAdmin, adminController.document.postAddNewDocument)

router.post("/admin/documents/add", middleware.isAdmin, adminController.document.postAddNewDocument);
//admin -> add new copy
router.get("/admin/document/:doc_id/copies/add", middleware.isAdmin, adminController.copy.getAddCopyDocument);
router.post("/admin/document/:doc_id/copies/add", middleware.isAdmin, adminController.copy.postAddCopyDocument);
//admin -> update document copy
router.get("/admin/document/:doc_id/copies/update/:copy_id", middleware.isAdmin, adminController.copy.getUpdateCopyDocument)
router.post("/admin/document/:doc_id/copies/update/:copy_id", middleware.isAdmin, adminController.copy.postUpdateCopyDocument)
//admin -> delete document copy 
router.get('/admin/document/:doc_id/copies/delete/:copy_id', middleware.isAdmin, adminController.copy.deleteCopyDocument)


//admin -> delete profile
router.delete("/admin/delete-profile", middleware.isAdmin, adminController.profile.deleteAdminProfile);
//admin -> update profile
router.post("/admin/profile", middleware.isAdmin, adminController.profile.postUpdateAdminProfile);
router.get("/admin/profile", middleware.isAdmin, adminController.profile.getAdminProfile);

//admin -> update password
router.put("/admin/update-password", middleware.isAdmin, adminController.profile.putUpdateAdminPassword);


router.get('/admin/issues/:page', middleware.isAdmin, adminController.issue.getIssues)
router.post('/admin/issues/:page', middleware.isAdmin, adminController.issue.postSearchIssues)

router.post('/admin/issue/add', middleware.isAdmin, adminController.issue.postIssueDocument)
router.get('/admin/issue/return/:issue_id', middleware.isAdmin, adminController.issue.ReturnDocument)

router.get('/admin/add', middleware.isAdmin, adminController.users.getAddPrivUser)
router.post('/admin/add', middleware.isAdmin, adminController.users.postAddPrivUser)
module.exports = router;