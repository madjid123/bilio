const User = require('../../models/user');// importing dependencies

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