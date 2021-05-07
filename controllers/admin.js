// importing dependencies
const fs = require('fs');

// importing models
const Document = require('../models/document');
const User = require('../models/user');
const Copy = require('../models/copy');
const Activity = require('../models/activity');
const Issue = require('../models/issue');
const Comment = require('../models/comment');

// importing utilities
const deleteImage = require('../utils/delete_image');

// GLOBAL_VARIABLES
const PER_PAGE = 10;

// admin -> show dashboard working procedure
/*
    1. Get user, document and activity count
    2. Fetch all activities in chunk (for pagination)
    3. Render admin/index
*/
exports.getDashboard = async (req, res, next) => {
    var page = req.query.page || 1;
    try {

        const users_count = await User.find().countDocuments() - 1;
        const documents_count = await Document.find().countDocuments();
        const activity_count = await Activity.find().countDocuments();
        const activities = await Activity
            .find()
            .sort('-entryTime')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        res.render("admin/index", {
            users_count: users_count,
            documents_count: documents_count,
            activities: activities,
            current: page,
            pages: Math.ceil(activity_count / PER_PAGE),
        });
    } catch (err) {
        console.log(err)
    }
}

// admin -> search activities working procedure
/*
    1. Get user and document count
    2. Fetch activities by search query
    3. Render admin/index
    **pagination is not done
*/
exports.postDashboard = async (req, res, next) => {
    try {
        const search_value = req.body.searchUser;

        // getting user and document count
        const documents_count = await Document.find().countDocuments();
        const users_count = await User.find().countDocuments();

        // fetching activities by search query
        const activities = await Activity
            .find({
                $or: [
                    { "user_id.username": search_value },
                    { "categorie": search_value }
                ]
            });

        // rendering
        res.render("admin/index", {
            users_count: users_count,
            documents_count: documents_count,
            activities: activities,
            current: 1,
            pages: 0,
        });

    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}

// admin -> delete profile working procedure
/*
    1. Find admin by user_id and remove
    2. Redirect back to /
*/
exports.deleteAdminProfile = async (req, res, next) => {
    try {
        await User.findByIdAndRemove(req.user._id);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

// admin -> get document inventory working procedure
/*
    1. Construct search object
    2. Fetch documents by search object
    3. Render admin/documentInventory
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

        // rendering admin/documentInventory
        res.render("admin/documentInventory", {
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
        const filter = req.body.filter.toLowerCase();
        const value = req.body.searchName;

        if (value == "") {
            req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;

        // get the documents count
        const documents_count = await Document.find(searchObj).countDocuments();

        // fetch the documents by search query
        const documents = await Document
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        // rendering admin/documentInventory
        res.render("admin/documentInventory", {
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
        var document = await Document.findById(doc_id).populate('copies');
        res.render('admin/Exemplaires', { copies: document.copies, doc_id: doc_id })
    }
    catch (err) {
        console.log(err)
        res.redirect('back')
    }
}
// admin -> get the document to be updated
exports.getUpdateDocument = async (req, res, next) => {

    try {
        const document_id = req.params.document_id;
        const document = await Document.findById(document_id).populate('copies');


        res.render('admin/document', {
            document: document,
        })
    } catch (err) {
        console.log(err);
        return res.redirect('back');
    }
};

// admin -> post update document
exports.postUpdateDocument = async (req, res, next) => {

    try {
        const resume = req.sanitize(req.body.document.resume);
        const document_info = req.body.document;
        const document_id = req.params.document_id;

        await Document.findByIdAndUpdate(document_id, document_info);

        res.redirect("/admin/documentInventory/all/all/1");
    } catch (err) {
        console.log(err);
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
        console.log(err);
        res.redirect('back');
    }
};

// admin -> get user list
exports.getUserList = async (req, res, next) => {
    try {
        const page = req.params.page || 1;

        const users = await User
            .find()
            .sort('-dateDadhesion')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const users_count = await User.find().countDocuments();

        res.render('admin/users', {
            users: users,
            current: page,
            pages: Math.ceil(users_count / PER_PAGE),
        });

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show searched user
exports.postShowSearchedUser = async (req, res, next) => {
    try {
        const page = req.params.page || 1;
        const search_value = req.body.searchUser;

        const users = await User.find({
            $or: [
                { "prenom": search_value },
                { "nom": search_value },
                { "username": search_value },
                { "email": search_value },
            ]
        });

        if (users.length <= 0) {
            req.flash("error", "User not found!");
            return res.redirect('back');
        } else {
            res.render("admin/users", {
                users: users,
                current: page,
                pages: 0,
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> flag/unflag user
exports.getFlagUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);

        if (user.violationFlag) {
            user.violationFlag = false;
            await user.save();
            req.flash("success", `An user named ${user.prenom} ${user.nom} is just unflagged!`);
        } else {
            user.violationFlag = true;
            await user.save();
            req.flash("warning", `An user named ${user.prenom} ${user.nom} is just flagged!`);
        }

        res.redirect("/admin/users/1");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show one user
exports.getUserProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);
        const issues = await Issue.find({ "user_id.id": user_id });
        const comments = await Comment.find({ "auteur.id": user_id });
        const activities = await Activity.find({ "user_id.id": user_id }).sort('-entryTime');

        res.render("admin/user", {
            user: user,
            issues: issues,
            activities: activities,
            comments: comments,
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

// admin -> show all activities of one user
exports.getUserAllActivities = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const activities = await Activity.find({ "user_id.id": user_id })
            .sort('-entryTime');
        res.render("admin/activities", {
            activities: activities
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show activities by categorie
exports.postShowActivitiesByCategory = async (req, res, next) => {
    try {
        const categorie = req.body.categorie;
        const activities = await Activity.find({ "categorie": categorie });

        res.render("admin/activities", {
            activities: activities,
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> delete a user
exports.getDeleteUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        await user.remove();

        let imagePath = `images/${user.image}`;
        if (fs.existsSync(imagePath)) {
            deleteImage(imagePath);
        }

        await Issue.deleteMany({ "user_id.id": user_id });
        await Comment.deleteMany({ "auteur.id": user_id });
        await Activity.deleteMany({ "user_id.id": user_id });

        res.redirect("/admin/users/1");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

// admin -> add new document
exports.getAddNewDocument = (req, res, next) => {
    res.render("admin/adddoc");
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
        console.log(err);
        res.redirect('back');
    }
};
//add new copy
exports.getAddCopyDocument = async (req, res, next) => {
    var document = await Document.findById(req.params.doc_id)
    res.render("admin/addCopy", { document: document })

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
        console.log(err)
        res.redirect('back')
    }
}
//  admin -> update document copy
exports.getUpdateCopyDocument = async (req, res, next) => {
    try {
        var copy = await Copy.findById(req.params.copy_id)

        res.render("admin/copy", { copy: copy, doc_id: req.params.doc_id })

    } catch (err) {
        console.log(err)
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
        console.log(err)
        res.redirect('back')
    }

}
//admin -> delete copy
exports.deleteCopyDocument = async (req, res, next) => {
    try {
        var copy = await Copy.findById(req.params.copy_id)
        var document = await Document.findById(copy.doc_id)
        document.updateOne({ $inc: { "stock": -1 } }, (err, doc) => { if (err) console.log(err) })
        document.availableCopies -= 1;
        await document.copies.pull({ _id: req.params.copy_id })
        await document.save();
        var doc_id = copy.doc_id
        await copy.remove();
        res.redirect('/admin/document/update/' + doc_id)
    } catch (err) {
        console.log(err)
    }
}

// admin -> get profile
exports.getAdminProfile = (req, res, next) => {
    res.render("admin/profile");
};

// admin -> update profile
exports.postUpdateAdminProfile = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const update_info = req.body.admin;

        await User.findByIdAndUpdate(user_id, update_info);

        res.redirect("/admin/profile");

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> update password
exports.putUpdateAdminPassword = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const old_password = req.body.oldPassword;
        const new_password = req.body.password;

        const admin = await User.findById(user_id);
        await admin.changePassword(old_password, new_password);
        await admin.save();

        req.flash("success", "Your password is changed recently. Please login again to confirm");
        res.redirect("/auth/admin-login");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> create an issue book for given user
exports.postIssueDocument = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const doc_id = req.params.doc_id

        const user = await User.findById(user_id)
        if (user.violationFlag) {
            req.flash("error", "You are flagged for violating rules/delay on returning documents/paying fines. Untill the flag is lifted, You can't issue any documents");
            return res.redirect("back");
        }

        if (user.documentIssueInfo.length >= 5) {
            req.flash("warning", "user can't  issue more than 5 documents at a time");
            return res.redirect("back");
        }

        const document = await Document.findById(doc_id).populate('copies');
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
        })
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
        user.save()
        document.save()
        issue.save()
        activity.save()
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}