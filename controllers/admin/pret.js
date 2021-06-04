
// importing models

const Document = require('../../models/document');
const User = require('../../models/user');
const Exemplaire = require('../../models/exemplaire');
const Activity = require('../../models/activity');
const Pret = require('../../models/pret');
const infogen = require('../../global/dureepret')
const PER_PAGE = 10
exports.getprets = async (req, res, next) => {
    try {
        const page = req.params.page || 1;

        const prets = await Pret
            .find()
            .sort('-document_info.pretDate')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)
            .populate("document_info.exemplaire_id.id")
            .populate("document_info.doc_id")
            .populate("user_id.id")
            .populate("admin_id.id")
            ;
        const prets_count = await Pret.find().countDocuments();

        res.render('admin/pret/prets', {
            prets: prets,
            current: page,
            pages: Math.ceil(prets_count / PER_PAGE),
        });

    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}
exports.postSearchprets = async (req, res, next) => {
    try {
       let SearchObj = {}
       if(req.body.filter == "cote"){
       SearchObj[`document_info.exemplaire_id.${req.body.filter}`] = req.body.searchName;

       }else{

       SearchObj[`user_id.${req.body.filter}`] = req.body.searchName;
       }
       const pret = await Pret.findOne(SearchObj)
       .populate("document_info.doc_id")
       .populate("document_info.exemplaire_id.id")
       .populate("user_id.id")
       res.render("admin/pret/prets" , {
           prets : [pret] ,
        pages: 0}
           )
    } catch (err) {
        console.error(err)
        req.flash("error", err.message)
        res.redirect('back');
    }
}
// admin -> create an pret book for given user
exports.postpretDocument = async (req, res, next) => {
    try {
        const user_num = req.body.user_num
        const Exemplaire_num = req.body.exemplaire_num

        const user = await User.findOne({ numero: user_num })
        if (!user) {

            req.flash("error", "Numero d'utilisateur inexistant");
            return res.redirect("back");
        }
        if (user.violationFlag) {
            req.flash("error", "l'utilisateur a ete suspendu");
            return res.redirect("back");
        }

        if (user.exemplairepretInfo && user.exemplairepretInfo.length >= 5) {
            req.flash("warning", "le lecteur ne peut pas prêt plus que 5 documents dans la même période");
            return res.redirect("back");
        }

        const Exemplaire = await Exemplaire.findOne({ cote: exemplaire_num })

        if (!exemplaire) {
            req.flash('error', "Ce exemplaire n'existe pas")
            return res.redirect("back");
        }

        // document.exemplaires.map(async (exemplaire) => {
        //     if (exemplaire.estDisponible == true) {
        //         exemplaire_id = exemplaire._id
        //         await Exemplaire.findByIdAndUpdate(exemplaire._id, { estDisponible: false }) //         return
        //     }
        // })
        if (exemplaire.estDisponible === false) {
            req.flash('error', "Ce exemplaire n'est pas disponible pour le moment");
            return res.redirect('back');
        }
        exemplaire.estDisponible = false
        const document = await Document.findById(exemplaire.doc_id)

        var dateDeRetourne;
        if (exemplaire.typePret === 'consultation sur place') {
            let tday = new Date()
            dateDeRetourne = tday.setHours(18, 0, 0)
        } else {
            dateDeRetourne = Date.now() + infogen.dureePret[user.categorie] * 24 * 60 * 60 * 1000
        }
        const pret = new pret({
            pretStatus: "en cours",
            pretType: exemplaire.typePret,
            document_info: {
                doc_id: exemplaire.doc_id,
                exemplaire_id: exemplaire._id,
                returnDate: dateDeRetourne
            },
            user_id: {
                id: user._id,
                username: user.username,
            },
            admin_id: {
                id: req.user._id,
                username: req.user.username
            }
        })
        await document.updateOne({ $inc: { "ExemplairesDisponible": -1 } })
        // putting pret record on individual user document
        user.exemplairepretInfo.push(exemplaire._id);

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "pret",
            time: {
                id: pret._id,
                pretDate: pret.document_info.pretDate,
                returnDate: pret.document_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });
        await user.save()
        await document.save()
        await pret.save()
        await activity.save()
        await Exemplaire.save()
        res.redirect('/admin/prets/1')
    } catch (err) {
        console.error(err);
        res.redirect('back')
    }
}
exports.ReturnDocument = async (req, res, next) => {
    try {
        // finding the position
        const pret = await Pret.findById(req.params.pret_id);

        const document_id = pret.document_info.doc_id;
        const user = await User.findById(pret.user_id.id)
        const pos = user.exemplairepretInfo.indexOf(document_id);

        // fetching document from db and increament
        const document = await Document.findById(document_id);
        document.ExemplairesDisponible += 1;
        await document.save();

        // updating availability statut.
        await Exemplaire.findByIdAndUpdate(pret.document_info.exemplaire_id, { estDisponible: true })

        // popping document pret info from user
        user.exemplairepretInfo.splice(pos, 1);
        await user.save();

        // logging the activity
        const activity = new Activity({
            info: {
                id: pret.document_info.id,
                titre: pret.document_info.titre,
            },
            categorie: "Return",
            time: {
                id: pret._id,
                pretDate: pret.document_info.pretDate,
                returnDate: pret.document_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            },
            admin: req.session.passport.user
        });
        await activity.save();
        await pret.remove();


        res.redirect("/admin/prets/1");
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}