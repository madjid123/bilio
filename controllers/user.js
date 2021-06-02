// importing dependencies
require('dotenv').config()
const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

// importing models
const User = require("../models/user"),
    Activity = require("../models/activity"),
    Document = require("../models/document"),
    pret = require("../models/pret"),
    Comment = require("../models/comment"),
    exemplaire = require('../models/exemplaire'),
    Reservation = require("../models/reservation");

// importing utilities
const deleteImage = require('../utils/delete_image');
const { exemplaire } = require('../routes/admin');

// GLOBAL_VARIABLES
const PER_PAGE = 5;

//user -> dashboard
exports.getUserDashboard = async (req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req.user._id;

    try {
        // fetch user info from db and populate it with related document pret
        const user = await User.findById(user_id);

        if (user.exemplairepretInfo.length > 0) {
            const prets = await pret.find({ "user_id.id": user._id });

            for (let pret of prets) {
                if (pret.document_info.returnDate < Date.now()) {
                    user.violatonFlag = true;
                    user.save();
                    req.flash("warning", "You are flagged for not returning " + pret.document_info.titre + " in time");
                    break;
                }
            }
        }

        res.render("user/index", {
            user: user,
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

        req.flash("success", "Your password is recently updated. Please log in again to confirm");
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
            "address": req.body.address,
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
        req.flash("error", "You are flagged for violating rules/delay on returning documents/paying fines. Untill the flag is lifted, You can't pret any documents");
        return res.redirect("back");
    }

    if (req.user.exemplairepretInfo.length >= 5) {
        req.flash("warning", "You can't pret more than 5 documents at a time");
        return res.redirect("back");
    }

    try {
        const document = await Document.findById(req.params.document_id).populate('copies');
        const user = await User.findById(req.params.user_id);

        // registering pret
        var exemplaire_id = null
        document.copies.map(async (exemplaire) => {
            if (exemplaire.isAvailable == true) {
                exemplaire_id = exemplaire._id
                await exemplaire.findByIdAndUpdate(exemplaire._id, { isAvailable: false })
                return
            }
        })
        const pret = new pret({
            pretStatus: "reserver",
            document_info: {
                doc_id: document._id,
                exemplaire_id: exemplaire_id
            },
            user_id: {
                id: user._id,
                username: user.username,
            },
            admin_id: {
                id: await User.findOne({ "username": req.session.passport.user }),
                username: req.session.passport.user
            }
        });
        const reservation = new Reservation({
            doc_info: {
                exemplaire_id: exemplaire_id
            },
            user_info: {
                id: user._id,
            },

        });

        await document.updateOne({ $inc: { "availableCopies": -1 } })
        // putting pret record on individual user document
        user.exemplairepretInfo.push(document._id);



        // await ensure to synchronously save all database alteration
        await pret.save();
        await user.save();
        await document.save();
        await reservation.save();
        res.redirect("/documents/all/all/1");
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}

// user -> show return-renew page
exports.getShowRenewReturn = async (req, res, next) => {
    const user_id = req.user._id;
    try {
        const pret = await pret.find({ "user_id.id": user_id });
        res.render("user/return-renew", { user: pret });
    } catch (err) {
        console.error(err);
        return res.redirect("back");
    }
}

// user -> renew document working procedure
/*
    1. construct the search object
    2. fetch prets based on search object
    3. increament return date by 7 days set isRenewed = true
    4. Log the activity
    5. save all db alteration
    6. redirect to /documents/return-renew
*/
exports.postRenewDocument = async (req, res, next) => {
    try {
        const searchObj = {
            "user_id.id": req.user._id,
            "document_info.doc_id": req.params.document_id,
        }
        const pret = await pret.findOne(searchObj);
        // adding extra 7 days to that pret
        let time = pret.document_info.returnDate.getTime();
        pret.document_info.returnDate = time + 7 * 24 * 60 * 60 * 1000;
        pret.document_info.isRenewed = true;

        // logging the activity


        await pret.save();

        res.redirect("/documents/return-renew");
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

        await pret.deleteMany({ "user_id.id": user_id });
        await Comment.deleteMany({ "auteur.id": user_id });
        await Activity.deleteMany({ "user_id.id": user_id });

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}

