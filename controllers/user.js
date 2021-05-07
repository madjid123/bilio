// importing dependencies
const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');


// importing models
const User = require("../models/user"),
    Activity = require("../models/activity"),
    Document = require("../models/document"),
    Issue = require("../models/issue"),
    Comment = require("../models/comment"),
    Copy = require('../models/copy'),
    Reservation = require("../models/reservation");

// importing utilities
const deleteImage = require('../utils/delete_image');
const { copy } = require('../routes/admin');

// GLOBAL_VARIABLES
const PER_PAGE = 5;

//user -> dashboard
exports.getUserDashboard = async (req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req.user._id;

    try {
        // fetch user info from db and populate it with related document issue
        const user = await User.findById(user_id);

        if (user.documentIssueInfo.length > 0) {
            const issues = await Issue.find({ "user_id.id": user._id });

            for (let issue of issues) {
                if (issue.document_info.returnDate < Date.now()) {
                    user.violatonFlag = true;
                    user.save();
                    req.flash("warning", "You are flagged for not returning " + issue.document_info.titre + " in time");
                    break;
                }
            }
        }
        const activities = await Activity
            .find({ "user_id.id": req.user._id })
            .sort({ _id: -1 })
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const activity_count = await Activity.find({ "user_id.id": req.user._id }).countDocuments();

        res.render("user/index", {
            user: user,
            current: page,
            pages: Math.ceil(activity_count / PER_PAGE),
            activities: activities,
        });
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

// user -> profile
exports.getUserProfile = (req, res, next) => {
    res.render("user/profile");
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

        // logging activity
        const activity = new Activity({
            categorie: "Update Password",
            user_id: {
                id: req.user._id,
                username: req.user.username,
            },
        });
        await activity.save();

        req.flash("success", "Your password is recently updated. Please log in again to confirm");
        res.redirect("/auth/user-login");
    } catch (err) {
        console.log(err);
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

        // logging activity
        const activity = new Activity({
            categorie: "Update Profile",
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        res.redirect('back');
    } catch (err) {
        console.log(err);
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
                    console.log(err);
                }
            })
        } else {
            imageUrl = 'profile.png';
        }

        user.image = imageUrl;
        await user.save();

        const activity = new Activity({
            categorie: "Upload Photo",
            user_id: {
                id: req.user._id,
                username: user.username,
            }
        });
        await activity.save();

        res.redirect("/user/1/profile");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

//user -> notification
exports.getNotification = async (req, res, next) => {
    res.render("user/notification");
}

//user -> issue a document
exports.postIssueDocument = async (req, res, next) => {
    if (req.user.violationFlag) {
        req.flash("error", "You are flagged for violating rules/delay on returning documents/paying fines. Untill the flag is lifted, You can't issue any documents");
        return res.redirect("back");
    }

    if (req.user.documentIssueInfo.length >= 5) {
        req.flash("warning", "You can't issue more than 5 documents at a time");
        return res.redirect("back");
    }

    try {
        const document = await Document.findById(req.params.document_id).populate('copies');
        const user = await User.findById(req.params.user_id);

        // registering issue
        var copy_id = null
        document.copies.map(async (copy) => {
            if (copy.isAvailable == true) {
                copy_id = copy._id
                await Copy.findByIdAndUpdate(copy._id, { isAvailable: false })
                return
            }
        })
        const issue = new Issue({
            issueStatus: "reserve",
            document_info: {
                doc_id: document._id,
                copy_id: copy_id
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
                copy_id: copy_id
            },
            user_info: {
                id: user._id,
            },

        });

        await document.updateOne({ $inc: { "availableCopies": -1 } })
        // putting issue record on individual user document
        user.documentIssueInfo.push(document._id);

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "Issue",
            time: {
                id: issue._id,
                issueDate: issue.document_info.issueDate,
                returnDate: issue.document_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });

        // await ensure to synchronously save all database alteration
        await issue.save();
        await user.save();
        await document.save();
        await activity.save();
        await reservation.save();
        res.redirect("/documents/all/all/1");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}

// user -> show return-renew page
exports.getShowRenewReturn = async (req, res, next) => {
    const user_id = req.user._id;
    try {
        const issue = await Issue.find({ "user_id.id": user_id });
        res.render("user/return-renew", { user: issue });
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}

// user -> renew document working procedure
/*
    1. construct the search object
    2. fetch issues based on search object
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
        const issue = await Issue.findOne(searchObj);
        // adding extra 7 days to that issue
        let time = issue.document_info.returnDate.getTime();
        issue.document_info.returnDate = time + 7 * 24 * 60 * 60 * 1000;
        issue.document_info.isRenewed = true;

        // logging the activity
        const activity = new Activity({
            info: {
                id: issue._id,
                titre: issue.document_info.titre,
            },
            categorie: "Renew",
            time: {
                id: issue._id,
                issueDate: issue.document_info.issueDate,
                returnDate: issue.document_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });

        await activity.save();
        await issue.save();

        res.redirect("/documents/return-renew");
    } catch (err) {
        console.log(err);
        return res.redirect("back");

    }
}

// user -> return document working procedure
/*
    1. Find the position of the document to be returned from user.documentIssueInfo
    2. Fetch the document from db and increament its stock by 1
    3. Remove issue record from db
    4. Pop documentIssueInfo from user by position
    5. Log the activity
    6. refirect to /documents/return-renew
*/
exports.postReturnDocument = async (req, res, next) => {
    try {
        // finding the position
        const document_id = req.params.document_id;
        const pos = req.user.documentIssueInfo.indexOf(req.params.document_id);

        // fetching document from db and increament
        const document = await Document.findById(document_id);
        document.availableCopies += 1;
        await document.save();

        // removing issue 
        const issue = await Issue.findOne({ "user_id.id": req.user._id });
        // updating availability status.
        const copy = await Copy.findByIdAndUpdate(issue.document_info.copy_id, { isAvailable: true })
        await issue.remove();

        // popping document issue info from user
        req.user.documentIssueInfo.splice(pos, 1);
        await req.user.save();

        // logging the activity
        const activity = new Activity({
            info: {
                id: issue.document_info.id,
                titre: issue.document_info.titre,
            },
            categorie: "Return",
            time: {
                id: issue._id,
                issueDate: issue.document_info.issueDate,
                returnDate: issue.document_info.returnDate,
            },
            user_id: {
                id: req.user._id,
                username: req.user.username,
            }
        });
        await activity.save();

        // redirecting
        res.redirect("/documents/return-renew");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}

// user -> create new comment working procedure
/* 
    1. Find the document to be commented by id
    2. Create new Comment instance and fill information inside it
    3. Log the activity
    4. Redirect to /documents/details/:document_id
*/
exports.postNewComment = async (req, res, next) => {
    try {
        const comment_text = req.body.comment;
        const user_id = req.user._id;
        const username = req.user.username;

        // fetching the document to be commented by id
        const document_id = req.params.document_id;
        const document = await Document.findById(document_id);

        // creating new comment instance
        const comment = new Comment({
            text: comment_text,
            auteur: {
                id: user_id,
                username: username,
            },
            document: {
                id: document._id,
                titre: document.titre,
            }
        });
        await comment.save();

        // pushing the comment id to document
        document.comments.push(comment._id);
        await document.save();

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "Comment",
            user_id: {
                id: user_id,
                username: username,
            }
        });
        await activity.save();

        res.redirect("/documents/details/" + document_id);
    } catch (err) {
        console.log(err);
        return res.redirect("back");

    }
}

// user -> update existing comment working procedure
/*
    1. Fetch the comment to be updated from db and update
    2. Fetch the document to be commented for logging document id, titre in activity
    3. Log the activity
    4. Redirect to /documents/details/"+document_id
*/
exports.postUpdateComment = async (req, res, next) => {
    const comment_id = req.params.comment_id;
    const comment_text = req.body.comment;
    const document_id = req.params.document_id;
    const username = req.user.username;
    const user_id = req.user._id;

    try {
        // fetching the comment by id
        await Comment.findByIdAndUpdate(comment_id, comment_text);

        // fetching the document
        const document = await Document.findById(document_id);

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "Update Comment",
            user_id: {
                id: user_id,
                username: username,
            }
        });
        await activity.save();

        // redirecting
        res.redirect("/documents/details/" + document_id);

    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }

}

// user -> delete existing comment working procedure
/* 
    1. Fetch the document info for logging info
    2. Find the position of comment id in document.comments array in Document model
    3. Pop the comment id by position from Document
    4. Find the comment and remove it from Comment
    5. Log the activity
    6. Redirect to /documents/details/" + document_id
*/
exports.deleteComment = async (req, res, next) => {
    const document_id = req.params.document_id;
    const comment_id = req.params.comment_id;
    const user_id = req.user._id;
    const username = req.user.username;
    try {
        // fetching the document
        const document = await Document.findById(document_id);

        // finding the position and popping comment_id
        const pos = document.comments.indexOf(comment_id);
        document.comments.splice(pos, 1);
        await document.save();

        // removing comment from Comment
        await Comment.findByIdAndRemove(comment_id);

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "Delete Comment",
            user_id: {
                id: user_id,
                username: username,
            }
        });
        await activity.save();

        // redirecting
        res.redirect("/documents/details/" + document_id);
    } catch (err) {
        console.log(err);
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

        await Issue.deleteMany({ "user_id.id": user_id });
        await Comment.deleteMany({ "auteur.id": user_id });
        await Activity.deleteMany({ "user_id.id": user_id });

        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

