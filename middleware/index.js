const multer = require("multer");

const middleware = {};

middleware.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in first");
    res.redirect("/");
};

middleware.isAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next();
    }
    req.flash("error", "Sorry, this route is allowed for admin only");
    res.redirect("/");
};
middleware.estBibliothecaire = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'bibliothecaire') {
        return next()
    }
    req.flash("error", "Accéss est permis que pour le bibliothecaire ")
    res.redierct('/')
}
middleware.upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

module.exports = middleware;