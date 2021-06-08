// importing libraries
const passport = require("passport");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

// importing models
const User = require("../models/user");

exports.getLandingPage = (req, res, next) => {
  res.redirect("/documents/all/all/1");
};

exports.getAdminLoginPage = (req, res, next) => {
  res.render("admin/adminLogin");
};

exports.getAdminLogout = (req, res, next) => {
  req.logout();
  res.redirect("/");
};

exports.getAdminSignUp = (req, res, next) => {
  res.render("signup", { estAdmin: false });
};

exports.postAdminSignUp = async (req, res, next) => {
  try {
    if (req.body.adminCode === process.env.ADMIN_SECRET) {
      const newAdmin = new User({
        username: req.body.username,
        email: req.body.email,
        type : req.body.type,
        estAdmin: true,
      });
      const user = await User.register(newAdmin, req.body.password);
      await passport.authenticate("local")(req, res, () => {
        req.flash(
          "success",
          "Bonjour, " + user.username + " Bienvenue au tableau de bord"
        );
        res.redirect("/admin");
      });
    } else {
      req.flash("error", "Secret code does not matching!");
      return res.redirect("back");
    }
  } catch (err) {
    req.flash(
      "error",
      "Given info matches someone registered as User. Please provide different info for registering as Admin"
    );
    return res.render("signup", { estAdmin: false });
  }
};

exports.getUserLoginPage = (req, res, next) => {
  res.render("user/userLogin");
};

exports.getUserLogout = async (req, res, next) => {
  await req.session.destroy();
  req.logout();
  res.redirect("/");
};

exports.getUserSignUp = (req, res, next) => {
  res.render("user/userSignup");
};

exports.postUserSignUp = async (req, res, next) => {
  try {
    with (req.body) {
      const newUser = new User({
        prenom: prenom,
        dateDeNaissance: new Date(dateDeNaissance),
        structure: structure,
        categorie: categorie,
        numero: numero,
        nom: nom,
        type: "lecteur",
        username: username,
        email: email,
        addresse: addresse,
        suspension_id: undefined
      });

      if(req.user && req.user !== 'lecteur') newUser.estInscrit = true
      await User.register(newUser, req.body.password);

      //var users = await User.find({})
      if(req.user &&req.user.type !=='lecteur') 
      res.redirect("/admin/users/1")
      else 
      passport.authenticate("local",{
        successRedirect : "/users/1", 
        failureRedirect : "/auth/user-signUp",

      },(req, res) =>{

      })
    }
  } catch (err) {
    console.error(err);
    req.flash("error", err.message)
    return res.redirect("back");
  }
};
