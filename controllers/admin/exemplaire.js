// importing models
const Document = require('../../models/document');
const exemplaire = require('../../models/exemplaire');


//add new exemplaire

exports.getAddexemplaireDocument = async (req, res, next) => {
    var document = await Document.findById(req.params.doc_id)
    res.render("admin/exemplaire/addexemplaire", { document: document })

}
exports.postAddexemplaireDocument = async (req, res, next) => {
    try {
        with (req.body.document) {
            var Documentexemplaire = {
                doc_id: req.params.doc_id,
                cote: cote,
                localization: localization,
                status: status,
                landtype: landtype,
                material: material
            };

        }

        var exemplaire = await exemplaire(Documentexemplaire)

        exemplaire.save()
        await Document.findByIdAndUpdate(req.params.doc_id, { $inc: { "stock": 1, "availableCopies": 1 }, $addToSet: { copies: [exemplaire._id] } })


        res.redirect("back")
    } catch (err) {
        console.error(err)
        res.redirect('back')
    }
}
//  admin -> update document exemplaire
exports.getUpdateexemplaireDocument = async (req, res, next) => {
    try {
        var exemplaire = await exemplaire.findById(req.params.exemplaire_id)

        res.render("admin/exemplaire/exemplaire", { exemplaire: exemplaire, doc_id: req.params.doc_id })

    } catch (err) {
        console.error(err)
        res.redirect('back')
    }
}
exports.postUpdateexemplaireDocument = async (req, res, next) => {
    try {
        var exemplaire_id = req.params.exemplaire_id
        with (req.body.document) {
            var documentexemplaire = {
                cote: cote,
                localization: localization,
                status: status,
                landtype: landtype

            }
            var exemplaire = await exemplaire.findByIdAndUpdate(exemplaire_id, documentexemplaire)
            res.redirect('/admin/document/update/' + exemplaire.doc_id)
        }


    } catch (err) {
        console.error(err)
        res.redirect('back')
    }

}
//admin -> delete exemplaire
exports.deleteexemplaireDocument = async (req, res, next) => {
    try {
        var exemplaire = await exemplaire.findById(req.params.exemplaire_id)
        var document = await Document.findById(exemplaire.doc_id)
        document.updateOne({ $inc: { "stock": -1 } }, (err, doc) => { if (err) console.error(err) })
        document.availableCopies -= 1;
        await document.copies.pull({ _id: req.params.exemplaire_id })
        await document.save();
        var doc_id = exemplaire.doc_id
        await exemplaire.remove();
        req.flash("success", `l'exemplaire  : "${exemplaire.cote}" du document [${document.titre}] a été supprimé`)
        res.redirect('/admin/document/' + doc_id + '/copies')
    } catch (err) {
        console.error(err)
    }
}
