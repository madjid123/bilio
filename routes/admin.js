const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    // fs = require("fs"),
    // path = require("path"),
    middleware = require("../middleware"),
    User = require("../models/user"),
    Document = require("../models/document"),
    Activity = require("../models/activity"),
    pret = require("../models/pret"),
    Comment = require("../models/comment");

// importing controller
const adminController = require('../controllers/admin');

//admin -> dashboard
router.get("/admin", middleware.estAdmin, adminController.dashboard.getDashboard);

//admin -> find activities of all users on admin dashboard
router.post("/admin", middleware.estAdmin, adminController.dashboard.postDashboard);



//admin document inventory
router.get("/admin/documentInventory/:filter/:value/:page", middleware.estAdmin, adminController.documents.getAdminDocumentInventory);
//admin -> show document copies
router.get("/admin/document/:doc_id/copies", middleware.estAdmin, adminController.documents.getDocumentCopies)
// admin -> show searched documents
router.post("/admin/documentInventory/:filter/:value/:page", middleware.estAdmin, adminController.documents.postAdminDocumentInventory);

//admin -> show documents to be updated
router.get("/admin/document/update/:document_id", middleware.estAdmin, adminController.document.getUpdateDocument);

//admin -> update document
router.post("/admin/document/update/:document_id", middleware.estAdmin, adminController.document.postUpdateDocument);

//admin -> delete document
router.get("/admin/document/delete/:document_id", middleware.estAdmin, adminController.document.getDeleteDocument);

//admin -> users list 
router.get("/admin/users/:page", middleware.estAdmin, adminController.users.getUserList);

//admin -> show searched user
router.post("/admin/users/:page", middleware.estAdmin, adminController.users.postShowSearchedUser);

//admin -> flag/unflag user
router.post("/admin/users/flagged/:user_id", middleware.estAdmin, adminController.users.postFlagUser);

//admin -> show one user
router.get("/admin/users/profile/:user_id", middleware.estAdmin, adminController.users.getUserProfile);

//admin -> show all activities of one user
router.get("/admin/users/activities/:user_id", middleware.estAdmin, adminController.users.getUserAllActivities);

//admin -> show activities by categorie
router.post("/admin/users/activities/:user_id", middleware.estAdmin, adminController.users.postShowActivitiesByCategory);

// admin -> delete a user
router.get("/admin/users/delete/:user_id", middleware.estAdmin, adminController.users.getDeleteUser);

//admin -> add new document
router.get("/admin/documents/add", middleware.estAdmin, adminController.document.getAddNewDocument);
router.post("/admin/documents/add", middleware.estAdmin, adminController.document.postAddNewDocument)

router.post("/admin/documents/add", middleware.estAdmin, adminController.document.postAddNewDocument);
//admin -> add new copy
router.get("/admin/document/:doc_id/copies/add", middleware.estAdmin, adminController.copy.getAddCopyDocument);
router.post("/admin/document/:doc_id/copies/add", middleware.estAdmin, adminController.copy.postAddCopyDocument);
//admin -> update document copy
router.get("/admin/document/:doc_id/copies/update/:copy_id", middleware.estAdmin, adminController.copy.getUpdateCopyDocument)
router.post("/admin/document/:doc_id/copies/update/:copy_id", middleware.estAdmin, adminController.copy.postUpdateCopyDocument)
//admin -> delete document copy 
router.get('/admin/document/:doc_id/copies/delete/:copy_id', middleware.estAdmin, adminController.copy.deleteCopyDocument)


//admin -> delete profile
router.delete("/admin/delete-profile", middleware.estAdmin, adminController.profile.deleteAdminProfile);
//admin -> update profile
router.post("/admin/profile", middleware.estAdmin, adminController.profile.postUpdateAdminProfile);
router.get("/admin/profile", middleware.estAdmin, adminController.profile.getAdminProfile);

//admin -> update password
router.put("/admin/update-password", middleware.estAdmin, adminController.profile.putUpdateAdminPassword);


router.get('/admin/prets/:page', middleware.estAdmin, adminController.pret.getprets)
router.post('/admin/prets/:page', middleware.estAdmin, adminController.pret.postSearchprets)

router.post('/admin/pret/add', middleware.estAdmin, adminController.pret.postpretDocument)
router.get('/admin/pret/return/:pret_id', middleware.estAdmin, adminController.pret.ReturnDocument)

router.get('/admin/suspensions/:page', [middleware.estAdmin, middleware.estBibliothecaire], adminController.suspensions.getSuspensions)

router.get('/admin/add', middleware.estAdmin, adminController.users.getAddPrivUser)
router.post('/admin/add', middleware.estAdmin, adminController.users.postAddPrivUser)

module.exports = router;