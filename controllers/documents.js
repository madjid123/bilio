const Document = require('../models/document');
const PER_PAGE = 16;



exports.getDocuments = async (req, res, next) => {
   var page = req.params.page || 1;
   const filter = req.params.filter;
   const value = req.params.value;
   let searchObj = {};

   // constructing search object
   if (filter != 'all' && value != 'all') {
      // fetch documents by search value and filter
      searchObj[filter] = value;
   }

   try {
      // Fetch documents from database
      const documents = await Document
         .find(searchObj)
         .skip((PER_PAGE * page) - PER_PAGE)
         .limit(PER_PAGE);

      // Get the count of total available document of given filter
      const count = await Document.find(searchObj).countDocuments();

      res.render("documents", {
         //res.json({
         documents: documents,
         current: page,
         pages: Math.ceil(count / PER_PAGE),
         filter: filter,
         value: value,
         user: req.user,
      })
   } catch (err) {
      console.error(err)
   }
}

exports.findDocuments = async (req, res, next) => {

   var page = req.params.page || 1;
   const filter = req.body.filter.toLowerCase();
   const value = req.body.searchName;

   // show flash message if empty search field is sent to backend
   if (value == "") {
      req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
      return res.redirect('back');
   }

   const searchObj = {};
   searchObj[filter] = value;

   try {
      // Fetch documents from database
      const documents = await Document
         .find(searchObj)
         .skip((PER_PAGE * page) - PER_PAGE)
         .limit(PER_PAGE)

      // Get the count of total available document of given filter
      const count = await Document.find(searchObj).countDocuments();

      res.render("documents", {
         documents: documents,
         current: page,
         pages: Math.ceil(count / PER_PAGE),
         filter: filter,
         value: value,
         user: req.user,
      })
   } catch (err) {
      console.error(err)
   }
}

// find document details working procedure
/*
   1. fetch document from db by id
   2. populate document with associated comments
   3. render user/documentDetails template and send the fetched document
*/

exports.getDocumentDetails = async (req, res, next) => {
   try {
      const document_id = req.params.document_id;
      const document = await Document.findById(document_id).populate("comments").populate("copies");
      res.render("user/documentDetails", { document: document });
   } catch (err) {
      console.error(err);
      return res.redirect("back");
   }
}