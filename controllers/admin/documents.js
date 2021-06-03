const Document = require('../../models/document');
// importing dependencies
// importing utilities

// GLOBAL_VARIABLES
const PER_PAGE = 10;
// importing utilities
// admin -> get document inventory working procedure
/*
    1. Construct search object
    2. Fetch documents by search object
    3. Render admin/document/documentInventory
*/
exports.getAdminDocumentInventory = async (req, res, next) => {
    try {
        let page = req.params.page || 1;
        const filter = req.params.filter;
        const value = req.params.value;

        // console.log(filter, value);
        // // constructing search object
        let searchObj = {};
        if (filter !== 'all' && value !== 'all') {
            // fetch documents by search value and filter
            searchObj[filter] = value;
        }

        // get the document counts
        const documents_count = await Document.find(searchObj).countDocuments();

        // fetching documents
        const documents = await Document
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)

        // rendering admin/document/documentInventory
        res.render("admin/document/documentInventory", {
            documents: documents,
            current: page,
            pages: Math.ceil(documents_count / PER_PAGE),
            filter: filter,
            value: value,
        });
    } catch (err) {
        // console.log(err.messge);
        return res.redirect('back');
    }
}

// admin -> return document inventory by search query working procedure
/*
    same as getAdminDocumentInventory method
*/
exports.postAdminDocumentInventory = async (req, res, next) => {
    try {
        let page = req.params.page || 1;
        const filter = req.body.filter;
        const value = req.body.searchName;

        if (value == "") {
            req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;
        console.log(searchObj);
        // get the documents count
        const documents_count = await Document.find(searchObj).countDocuments();

        // fetch the documents by search query
        const documents = await Document
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        // rendering admin/document/documentInventory
        res.render("admin/document/documentInventory", {
            documents: documents,
            current: page,
            pages: Math.ceil(documents_count / PER_PAGE),
            filter: filter,
            value: value,
        });

    } catch (err) {
        // console.log(err.message);
        return res.redirect('back');
    }
}
exports.getDocumentCopies = async (req, res, next) => {
    const doc_id = req.params.doc_id;
    try {
        var document = await Document.findById(doc_id).populate('exemplaires');
        res.render('admin/exemplaire/Exemplaires', { exemplaire: document.exemplaires, doc_id: doc_id })
    }
    catch (err) {
        console.error(err)
        res.redirect('back')
    }
}