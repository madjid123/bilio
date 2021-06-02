const express = require("express"),
    router = express.Router();


// Importing controller
const documentController = require('../controllers/documents');

// Parcourir les documents
router.get("/documents/:filter/:value/:page", documentController.getDocuments);

// Fetch documents by search value
router.post("/documents/:filter/:value/:page", documentController.findDocuments);

// Fetch individual document details
router.get("/documents/details/:document_id", documentController.getDocumentDetails);

module.exports = router;