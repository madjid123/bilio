// importing dependencies
require('dotenv').config()
const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

// importing models
const User = require("../models/user"),
    Activity = require("../models/activity"),
    Document = require("../models/document"),
    Pret = require("../models/pret"),
    Exemplaire = require('../models/exemplaire'),
    infogen = require('../global/dureepret');

// importing utilities
const deleteImage = require('../utils/delete_image');
const {
    exemplaire
} = require('../routes/admin');

// GLOBAL_VARIABLES
const PER_PAGE = 5;

//user -> dashboard
exports.getUserDashboard = async (req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req.user._id;

    try {
        // fetch user info from db and populate it with related document pret
        const user = await User.findById(user_id);
        const pret = await Pret.find({
                "user_id.id": user_id,
                $or: [{
                        "pretStatut": "en cours"
                    },
                    {
                        "pretStatut": "reserver"
                    },
                    {
                        "pretStatut": "retard"
                    },
                    {
                        "pretStatut": "prolonoger"
                    }
                ]
            })
            .populate('document_info.doc_id')
            .populate('document_info.exemplaire_id');

        res.render("user/index", {
            user: user,
            prets: pret,
            current: page,
        });
    } catch (err) {
        console.error(err);
        return res.redirect('back');
    }
}

// user -> profile
exports.getUserProfile = (req, res, next) => {
    res.render("user/profile", req.user);
}

// user -> update/change password
exports.putUpdatePassword = async (req, res, next) => {
    const username = req.user.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.password;

    try {
        const user = await User.findByUsername(username);
        await user.changePassword(oldPassword, newPassword);
        await user.save();

        req.flash("success", "Votre mot de passe a été changer.");
        res.redirect("/auth/user-login");
    } catch (err) {
        console.error(err);
        return res.redirect('back');
    }
}

// user -> update profile
exports.putUpdateUserProfile = async (req, res, next) => {
    try {
        const userUpdateInfo = {
            "prenom": req.body.prenom,
            "nom": req.body.nom,
            "email": req.body.email,
            "addresse": req.body.addresse,
        }
        await User.findByIdAndUpdate(req.user._id, userUpdateInfo);

        res.redirect('back');
    } catch (err) {
        console.error(err);
        return res.redirect('back');
    }
}

// upload image
exports.postUploadUserImage = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const user = await User.findById(user_id);

        let imageUrl;
        if (req.file) {
            imageUrl = `${uid()}__${req.file.originalname}`;
            let filename = `images/${imageUrl}`;
            let previousImagePath = `images/${user.image}`;

            const imageExist = fs.existsSync(previousImagePath);
            if (imageExist) {
                deleteImage(previousImagePath);
            }
            await sharp(req.file.path)
                .rotate()
                .resize(500, 500)
                .toFile(filename);

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(err);
                }
            })
        } else {
            imageUrl = 'profile.png';
        }

        user.image = imageUrl;
        await user.save();



        res.redirect("/user/1/profile");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

//user -> notification
exports.getNotification = async (req, res, next) => {
    res.render("user/notification");
}

//user -> pret a document
exports.postpretDocument = async (req, res, next) => {
    if (req.user.violationFlag) {
        req.flash("error", "Vous êtes suspendu ,Vous ne pouvez pas prêt un document");
        return res.redirect("back");

    }

    if (req.user.exemplairepretInfo.length >= 3) {
        req.flash("warning", "Vous ne pouvez pas prêter plus que 3 document en même temps");
        return res.redirect("back");
    }

    try {
        const document = await Document.findById(req.params.document_id).populate('exemplaires');
        const user = await User.findById(req.params.user_id);

        const existe = await Pret.exists({
            "user_id.id": user._id,
            "document_info.doc_id": document._id,
            "pretStatut": "en cours"
        })
        if (existe) {
            req.flash("error", "Vous ne pouvez pas prêt le meme document")
            return res.redirect('back')
        }
        const exemplaire = await Exemplaire.findOne({
            "doc_id": document._id,
            "estDisponible": true
        })
        console.log("exemplaire :  ", exemplaire.cote, " id : ", exemplaire._id)
        console.log("doc_id : ", req.params.document_id)
        console.log("ex doc_id", exemplaire.doc_id)

        let tday = new Date()
        const pret = new Pret({
            pretStatut: "reserver",
            document_info: {
                doc_id: document._id,
                exemplaire_id: {
                    id: exemplaire._id,
                    cote: exemplaire.cote
                }
            },
            user_id: {
                id: user._id,
                username: user.username,
                numero: user.numero
            },


        });
        exemplaire.estDisponible = false

        pret.createdAt = tday

        pret.document_info.dateDeRetour = (new Date()).setDate(tday.getDate() + infogen.dureePret[user.categorie])
        await document.updateOne({
            $inc: {
                "ExemplairesDisponible": -1
            }
        })
        // putting pret record on individual user document
        user.exemplairepretInfo.push(exemplaire._id);



        // await ensure to synchronously save all database alteration
        await exemplaire.save();
        await pret.save();
        await user.save();
        await document.save();
        res.redirect("/documents/all/all/1");
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}

// user -> show MesPrets page
exports.getShowRenewReturn = async (req, res, next) => {
    const user_id = req.user._id;
    try {
        const pret = await Pret.find({
                "user_id.id": user_id
            })
            .populate('document_info.doc_id')
            .populate('document_info.exemplaire_id');
        res.render("user/MesPrets", {
            prets: pret
        });
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}

// user -> renew document working procedure
/*
    1. construct the search object
    2. fetch prets based on search object
    3. increament return date by 7 days set estProlonoger = true
    4. Log the activity
    5. save all db alteration
    6. redirect to /documents/MesPrets
*/
exports.postRenewDocument = async (req, res, next) => {
    try {
        const searchObj = {
            "user_id.id": req.user._id,
            "document_info.doc_id": req.params.document_id,
        }
        const pret = await Pret.findOne(searchObj);
        // adding extra 7 days to that pret
        let time = pret.document_info.dateDeRetour.getTime();
        pret.document_info.dateDeRetour = time + 7 * 24 * 60 * 60 * 1000;
        pret.document_info.estProlonoger = true;

        // logging the activity


        await pret.save();

        res.redirect("/documents/MesPrets");
    } catch (err) {
        console.error(err);
        return res.redirect("back");

    }
}


// user -> delete user account
exports.deleteUserAccount = async (req, res, next) => {
    try {
        const user_id = req.user._id;

        const user = await User.findById(user_id);
        await user.remove();

        let imagePath = `images/${user.image}`;
        if (fs.existsSync(imagePath)) {
            deleteImage(imagePath);
        }

        await pret.deleteMany({
            "user_id.id": user_id
        });
        await Activity.deleteMany({
            "user_id.id": user_id
        });

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}