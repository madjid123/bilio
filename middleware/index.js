const multer = require("multer");

const middleware = {};

middleware.estConnecte = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Vous devez être connecté pour y accéder");
    res.redirect("/");
};
middleware.estNonConnecte = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Vous êtes déja connecté");
    res.redirect("back");
};

middleware.estAdmin = function (req, res, next) {
    if (req.isAuthenticated() && (req.user.type === 'admin' || req.user.type === 'bibliothecaire')) {
        return next();
    }
    console.log({res,next })
    req.flash("error", "Accés est permis que pour l'administrateur");
    res.redirect("/");
};
middleware.estLecteur = function (req, res, next) {
    if (req.isAuthenticated() && req.user.type === 'lecteur') {
        return next();
    }
console.log({res,next })
    req.flash("error", "Accés réserver au lecteur");
    res.redirect("/");
};
middleware.estSuperAdmin= function (req, res, next) {
    
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next()
    }
    req.flash("error", "Accés réserver bibliothecaire ")
    res.redirect("/")
};
middleware.upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

module.exports = middleware;