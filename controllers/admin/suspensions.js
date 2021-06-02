const Suspension = require("../../models/suspension")

const PER_PAGE = 10;
exports.getSuspensions = async (req, res, next) => {
    try {
        const page = req.params.page || 1

        const suspensions = await Suspension
            .find()
            .sort('date')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)
            .populate("user.id")


        const suspensions_count = await Suspension.find().countDocuments();

        res.render('admin/user/suspensions', {
            suspensions: suspensions,
            current: page,
            pages: Math.ceil(suspensions_count / PER_PAGE),
        });

    } catch (err) {
        console.log(err)
        res.redirect('back')
    }
}