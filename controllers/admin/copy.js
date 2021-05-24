// importing models
const Document = require('../../models/document');
const Copy = require('../../models/copy');


//add new copy

exports.getAddCopyDocument = async (req, res, next) => {
    var document = await Document.findById(req.params.doc_id)
    res.render("admin/copy/addCopy", { document: document })

}
exports.postAddCopyDocument = async (req, res, next) => {
    try {
        with (req.body.document) {
            var DocumentCopy = {
                doc_id: req.params.doc_id,
                cote: cote,
                localization: localization,
                status: status,
                landtype: landtype,
                material: material
            };

        }

        var copy = await Copy(DocumentCopy)

        copy.save()
        await Document.findByIdAndUpdate(req.params.doc_id, { $inc: { "stock": 1, "availableCopies": 1 }, $addToSet: { copies: [copy._id] } })


        res.redirect("back")
    } catch (err) {
        console.error(err)
        res.redirect('back')
    }
}
//  admin -> update document copy
exports.getUpdateCopyDocument = async (req, res, next) => {
    try {
        var copy = await Copy.findById(req.params.copy_id)

        res.render("admin/copy/copy", { copy: copy, doc_id: req.params.doc_id })

    } catch (err) {
        console.error(err)
        res.redirect('back')
    }
}
exports.postUpdateCopyDocument = async (req, res, next) => {
    try {
        var copy_id = req.params.copy_id
        with (req.body.document) {
            var documentCopy = {
                cote: cote,
                localization: localization,
                status: status,
                landtype: landtype

            }
            var copy = await Copy.findByIdAndUpdate(copy_id, documentCopy)
            res.redirect('/admin/document/update/' + copy.doc_id)
        }


    } catch (err) {
        console.error(err)
        res.redirect('back')
    }

}
//admin -> delete copy
exports.deleteCopyDocument = async (req, res, next) => {
    try {
        var copy = await Copy.findById(req.params.copy_id)
        var document = await Document.findById(copy.doc_id)
        document.updateOne({ $inc: { "stock": -1 } }, (err, doc) => { if (err) console.error(err) })
        document.availableCopies -= 1;
        await document.copies.pull({ _id: req.params.copy_id })
        await document.save();
        var doc_id = copy.doc_id
        await copy.remove();
        req.flash("success", `l'exemplaire  : "${copy.cote}" du document [${document.titre}] a été supprimé`)
        res.redirect('/admin/document/' + doc_id + '/copies')
    } catch (err) {
        console.error(err)
    }
}
