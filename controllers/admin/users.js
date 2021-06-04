// importing dependencies
const fs = require('fs');
const Mongoclient = require('mongodb').MongoClient

const client = Mongoclient.connect(process.env.DB_URL, { useUnifiedTopology: true })
// importing models
const User = require('../../models/user');
const Activity = require('../../models/activity');
const Pret = require('../../models/pret');
const Comment = require('../../models/comment');
const Suspension = require('../../models/suspension');
// importing utilities
const deleteImage = require('../../utils/delete_image');

// GLOBAL_VARIABLES
const PER_PAGE = 10;
// admin -> get user list
exports.getUserList = async (req, res, next) => {
    try {
        const page = req.params.page || 1;

        const users = await User
            .find({type : "lecteur"})
            .sort('-dateDadhesion')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)
            .populate("suspension_id");

        const users_count = await User.find().countDocuments();

        res.render('admin/user/users', {
            users: users,
            current: page,
            pages: Math.ceil(users_count / PER_PAGE),
        });

    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// admin -> show searched user
exports.postShowSearchedUser = async (req, res, next) => {
    try {
        const page = req.params.page || 1;
        const search_value = req.body.searchUser;

        const users = await User.find({type : "lecteur",
            $or: [
                { "prenom": { $regex: ".*" + search_value + ".*" } },
                { "nom": { $regex: ".*" + search_value + ".*" } },
                { "username": { $regex: ".*" + search_value + ".*" } },
                { "email": { $regex: ".*" + search_value + ".*" } },
            ]
        });

        if (users.length <= 0) {
            req.flash("error", "User not found!");
            return res.redirect('back');
        } else {
            res.render("admin/user/users", {
                users: users,
                current: page,
                pages: 0,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// admin -> flag/unflag user
exports.postFlagUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);

        if (user.violationFlag) {
            user.violationFlag = false;
            await Suspension.findOneAndRemove({ "user.id": user_id });
            await user.save();
            req.flash("success", `An user named ${user.prenom} ${user.nom} is just unflagged!`);
        } else {
            //user.violationFlag = true;

            const suspension = new Suspension({
                user: {
                    id: user._id,
                    numero: user.numero
                },
                motif: req.body.motif,


            }
            )
            let duree =  (!Number.isNaN(Number.parseInt(req.body.duree))) ? Number.parseInt(req.body.duree ): undefined;
            let tday = new Date()
            if(duree)
                tday.setDate(tday.getDate() + duree)
            
            suspension.expireAt = (duree) ? tday : undefined;
            suspension.duree= duree;

            await suspension.save()
            user.suspension_id = suspension._id

            await user.save();
            //            await Suspension.updateOne({ _id: suspension._id }, { created_at: { index: { expires: "10s" } } })

            req.flash("warning", `An user named ${user.prenom} ${user.nom} is just flagged!`);
        }

        res.redirect("back");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// admin : inscription d'un etudiant
exports.getInscrireUser = async (req, res, next)  =>{
    try {

        const user_id = req.params.user_id
        const user = await User.findById(user_id)
        if(user.estInscrit){
            user.estInscrit = false;
            user.save()
            req.flash("success","Utilisateur est non inscrit")
            res.redirect('/admin/users/1')
        }
        await User.findByIdAndUpdate(user_id, {estInscrit : true})
        req.flash('success', "Utilisateur est incrit!")
        res.redirect('/admin/users/1')

    }catch(err){
        console.error(err)
        req.flash("error", err.message)
        res.redirect('back')
    }
}
exports.getSupprimerToutInscription = async (req, res, next) => {
    try {
        await User.updateMany({estInscrit : true},{estInscrit : false} )
        req.flash('success','Les inscriptions ont été supprimeés')
        res.redirect('/admin/users/1')
    }catch(err){
        console.error(err)
        req.flash("error", err.message)
        res.redirect('back')
    }
}
// admin -> show one user
exports.getUserProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        const prets = await Pret.find({ "user_id.id": user_id });
        const comments = await Comment.find({ "auteur.id": user_id });
        const activities = await Activity.find({ "user_id.id": user_id }).sort('-entryTime');

        res.render("admin/user/user", {
            user: user,
            prets: prets,
            activities: activities,
            comments: comments,
        });
    } catch (err) {
        console.error(err);
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
        console.error(err);
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
        console.error(err);
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

        await pret.deleteMany({ "user_id.id": user_id });
        await Comment.deleteMany({ "auteur.id": user_id });
        await Activity.deleteMany({ "user_id.id": user_id });

        res.redirect("/admin/users/1");
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}
exports.getAddPrivUser = async (req, res, next) => {
    try {
        res.render('signup', { estAdmin: true })
    } catch (err) {
        console.error(err)
        res.redirect('back')
    }

}
exports.postAddPrivUser = async (req, res, next) => {
    try {
        if (req.body.adminCode === process.env.ADMIN_SECRET) {
            const newAdmin = new User({
                username: req.body.username,
                email: req.body.email,
                type: req.body.type,
                estAdmin: (req.body.type === 'admin') ? true : false,
            });

            const user = await User.register(newAdmin, req.body.password);
            req.flash(
                "success",
                "utilisateur : " + user.username + "[" + user.type + "] a été enregistré !"
            );
            res.redirect("/admin/user/priv");
        } else {
            req.flash("error", "Secret code does not matching!");
            return res.redirect("back");
        }
    } catch (err) {
        req.flash(
            "error",
            "Given info matches someone registered as User. Please provide different info for registering as Admin"
        ); console.error(err)

        return res.render("signup", { estAdmin: true });
    }

}

exports.getPrivUser = async (req, res, next) => {
    const users = await User.find(  {type : "bibliothecaire" })
    res.render("admin/user/privUsers",{
        users: users ,
        pages : 0,
    })
}
exports.deletePrivUser = async (req, res, next) => {
    try{
    await User.findByIdAndRemove(req.params.user_id);
    req.flash("success","Utilisateur a été supprimé")
    res.redirect('/admin/user/priv')
    }catch {
        console.error(err)
        req.flash("error", "erreur lors la suppression de l'utilisateur.")
        res.redirect('back')
    }
}
exports.updatePrivUser = async (req, res, next) => {
    try {
        with (req.body.admin) {
        const updateObj={
            username : username ,
            email: email

        }
const user = await User.findByIdAndUpdate(req.params.user_id, updateObj)
    
    
    req.flash('success', "Modification de l'utilisateur :  " + user.username )     
    res.redirect('/admin/user/priv')
        }
    }catch(err){
        console.error(err)

        req.flash("error", "erreur lors de la modification de l'utilisateur. \n " + err.message )
        res.redirect('back')
    }
}
