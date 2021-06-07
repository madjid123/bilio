
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
            .sort('-document_info.dateDePret')
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
       
       SearchObj[`${req.body.filter}`] = req.body.searchName;

       
    console.log(SearchObj)
       const prets = await Pret.find(SearchObj)
       .sort("-document_info.dateDePret")
       .populate("document_info.doc_id")
       .populate("document_info.exemplaire_id.id")
       .populate("user_id.id");
       res.render("admin/pret/prets" , {
           prets : prets ,
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
        const exemplaire_num = req.body.exemplaire_num

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

        const exemplaire = await Exemplaire.findOne({ cote: exemplaire_num })

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

        var dateDeRetour;
        if (exemplaire.typePret === 'consultation sur place') {
            let tday = new Date()
            dateDeRetour = tday.setHours(18, 0, 0)
        } else {
            dateDeRetour = Date.now() + infogen.dureePret[user.categorie] * 24 * 60 * 60 * 1000
        }
        const pret = new Pret({
            pretStatut: "en cours",
            pretType: exemplaire.typePret,
            document_info: {
                doc_id: exemplaire.doc_id,
                exemplaire_id:{ id : exemplaire._id, cote : exemplaire.cote},
                dateDeRetour: dateDeRetour
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
                dateDePret: pret.document_info.dateDePret,
                dateDeRetour: pret.document_info.dateDeRetour,
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
        if(pret.pretStatut !== "en cours" && pret.pretStatut !== "retard"){
            req.flash('error',"Opération non autotisée")
            console.error("skfjd")
            res.redirect('back')
            return;
        }
        const exemplaire_id= pret.document_info.exemplaire_id.id;
        const document_id = pret.document_info.doc_id;
        const user = await User.findById(pret.user_id.id)
        const pos = user.exemplairepretInfo.indexOf(exemplaire_id);

        // fetching document from db and increament
        const document = await Document.findById(document_id);
        document.ExemplairesDisponible += 1;
        await document.save();

        // updating availability statut.
        await Exemplaire.findByIdAndUpdate(pret.document_info.exemplaire_id.id, { estDisponible: true })

        // popping document pret info from user
        user.exemplairepretInfo.splice(pos, 1);
        await user.save();
        pret.pretStatut = "retourner"
        // logging the activity
        const activity = new Activity({
            info: {
                id: pret.document_info.id,
                titre: pret.document_info.titre,
            },
            categorie: "Return",
            time: {
                id: pret._id,
                dateDePret: pret.document_info.dateDePret,
                dateDeRetour: pret.document_info.dateDeRetour,
            },
            user_id: {
                id: user._id,
                username: user.username,
            },
            admin: req.session.passport.user
        });
        await activity.save();
        await pret.save();


        res.redirect("/admin/prets/1");
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}
exports.getConfirmerPret = async (req, res, next) => {
    try {
        const pret_id = req.params.pret_id
        
        const pret = await Pret.findById(pret_id)
        if(pret.pretStatut !== "reserver"){
            req.flash("error","operation non permise")
            res.redirect('back')
            return;
        }
        pret.pretStatut = "en cours"
        pret.admin_id = {id : req.user._id, username : req.user.username}
        pret.save()
        req.flash("success","Prêt est confimer")
        res.redirect('back')
    }catch (err) {
        console.error(err)
        req.flash("error",err.message)
        res.redirect('back')
    }
}
exports.getProlonogerPret = async (req, res, next) => {
    try {
        const pret_id = req.params.pret_id
        const pret = await Pret.findById(pret_id )
        const user = await User.findById( pret.user_id.id)
         if(pret.pretStatut !== "en cours"){
            req.flash("error","operation non permise")
            res.redirect('back')
            return;
        }
        if(pret.document_info.estProlonoger){
            req.flash("error","Vous ne pouvez pas pronologer un pret plus qu'une fois")
            res.redirect('back')
            return;
        }
        let tday = new Date()
        let pretDate = new Date(pret.document_info.dateDeRetour)
        tday = tday.setDate(pretDate.getDate() + infogen.dureePret[user.categorie])
        pret.document_info.dateDeRetour= tday
        pret.document_info.estProlonoger = true
        pret.save()
        req.flash("success","Prêt a été pronologer")
        res.redirect('back')
    }catch (err) {
        console.error(err)
        req.flash("error",err.message)
        res.redirect('back')
    }
}