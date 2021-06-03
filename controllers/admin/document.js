
// importing models
const Document = require('../../models/document');

// admin -> add new document
exports.getAddNewDocument = (req, res, next) => {
    res.render("admin/document/adddoc");
}

exports.postAddNewDocument = async (req, res, next) => {
    try {
        const document_info = req.body.document;
        document_info.resume = req.sanitize(document_info.resume);

        const isDuplicate = await Document.find(document_info);

        if (isDuplicate.length > 0) {
            req.flash("error", "This document is already registered in inventory");
            return res.redirect('back');
        }

        const new_document = new Document(document_info);
        await new_document.save();
        req.flash("success", `A new document named ${new_document.titre} is added to the inventory`);
        res.redirect("/admin/documentInventory/all/all/1");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// admin -> get the document to be updated
exports.getUpdateDocument = async (req, res, next) => {

    try {
        const document_id = req.params.document_id;
        const document = await Document.findById(document_id).populate('exemplaire');


        res.render('admin/document/document', {
            document: document,
        })
    } catch (err) {
        console.error(err);
        return res.redirect('back');
    }
};

// admin -> post update document
exports.postUpdateDocument = async (req, res, next) => {

    try {
        const resume = req.sanitize(req.body.document.resume);
        const document_info = req.body.document;
        docuemnt_info.resume = resume
        const document_id = req.params.document_id;

        await Document.findByIdAndUpdate(document_id, document_info);

        res.redirect("/admin/documentInventory/all/all/1");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// admin -> delete document
exports.getDeleteDocument = async (req, res, next) => {
    try {
        const document_id = req.params.document_id;

        const document = await Document.findById(document_id);
        await document.remove();

        req.flash("success", `A document named ${document.titre} is just deleted!`);
        res.redirect('back');

    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};
