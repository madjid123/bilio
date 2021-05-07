// importing dependencies
const fs = require('fs');

// importing models
const User = require('../models/user');
const Activity = require('../models/activity');
const Issue = require('../models/issue');
const Comment = require('../models/comment');

// importing utilities
const deleteImage = require('../utils/delete_image');

// GLOBAL_VARIABLES
const PER_PAGE = 10;
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
