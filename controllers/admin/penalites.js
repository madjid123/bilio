const User = require('../../models/user'),
    Penalite = require('../../models/penalite')

const PER_PAGE = 10;
exports.getPenalites = async (req, res, next) => {
    try {
        const page = req.params.page || 1;

        const penalites = await Penalite
            .find()
            .sort('-dateDePenalite')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)
            .populate("user_id")
            .populate("admin_id");
        const penalites_count = await Penalite.find().countDocuments();
        res.render('admin/pret/penalites', {
            penalites: penalites,
            current: page,
            pages: Math.ceil(penalites_count / PER_PAGE),
        });

    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}
exports.postRecherchPenalitees = async (req, res, next) => {
    try {
        const page = req.params.page || 1;
        let searchObj = {}
        searchObj[`${req.body.filter}`] = req.body.searchName;
        const penalites = await Penalite
            .find(searchObj)
            .sort('-dateDePenalite')
            .populate("user_id")
            .populate("admin_id");
        res.render('admin/pret/penalites', {
            penalites: penalites,
            pages: 0
        });

    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}
exports.postPenalite = async (req, res, next) => {
    try {
        var penaliteObj = req.body.penalite

        const user = await User.findOne({
            'numero': req.body.penalite.numero
        })
        penaliteObj.montant = Number.parseInt(penaliteObj.montant)
        penaliteObj["user_id"] = user._id
        penaliteObj["admin_id"] = req.user._id
        const penalite = new Penalite(penaliteObj)
        penalite.save()
        req.flash("success", "Une Pénalité a été ajouté pour le lecteur : " + user.username)
        res.redirect('/admin/users/penalites/1');
    } catch (err) {
        console.log(err)
        req.flash("error", err.message)
        res.redirect('back')
    }

}
exports.deletePenalite = async (req, res, next) => {
    try {
        await Penalite.findOneAndUpdate({
            "user_id": req.params.user_id
        }, {
            "etat": "paye"
        })
        req.flash("success", "Pénalité est enlevée")
        res.redirect('back')

    } catch (err) {
        console.log(err)
        req.flash("error", err.message)
        res.redirect('back')
    }
}