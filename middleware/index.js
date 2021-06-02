const multer = require("multer");

const middleware = {};

middleware.estConnecte = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Vous devez être connecté pour y accéder");
    res.redirect("/");
};

middleware.estAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next();
    }
    req.flash("error", "Accés est permis que pour l'administrateur");
    res.redirect("/");
};
middleware.estLecteur = function (req, res, next) {
    if (req.isAuthenticated() && req.user.type === 'lecteur') {
        return next();
    }
    req.flash("error", "Accés réserver au lecteur");
    res.redirect("/");
};
middleware.estBibliothecaire = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'bibliothecaire') {
        return next()
    }
    req.flash("error", "Accés réserver bibliothecaire ")
    res.redierct('/')
}
middleware.upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

module.exports = middleware;