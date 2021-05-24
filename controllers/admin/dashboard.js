// importing models
const Document = require('../../models/document');
const User = require('../../models/user');
const Activity = require('../../models/activity');
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
        console.error(err)
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
        console.error(err);
        return res.redirect("back");
    }
}