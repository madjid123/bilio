
// importing models
const Document = require('../../models/document');
const User = require('../../models/user');
const Copy = require('../../models/copy');
const Activity = require('../../models/activity');
const Issue = require('../../models/issue');
const PER_PAGE = 10
exports.getIssues = async (req, res, next) => {
    try {
        const page = req.params.page || 1;

        const issues = await Issue
            .find()
            .sort('-document_info.issueDate')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE)
            .populate("document_info.copy_id")
            .populate("document_info.doc_id")
            .populate("user_id.id")
            .populate("admin_id.id")
            ;

        const issues_count = await Issue.find().countDocuments();

        res.render('admin/pret/prets', {
            issues: issues,
            current: page,
            pages: Math.ceil(issues_count / PER_PAGE),
        });

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}
exports.postSearchIssues = async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err)
        console.error(err.message)
        res.redirect('back');
    }
}
// admin -> create an issue book for given user
exports.postIssueDocument = async (req, res, next) => {
    try {
        const user_num = req.body.user_num
        const copy_num = req.body.copy_num

        const user = await User.findOne({ numero: user_num })

        if (user.violationFlag) {
            req.flash("error", "You are flagged for violating rules/delay on returning documents/paying fines. Untill the flag is lifted, You can't issue any documents");
            return res.redirect("back");
        }

        if (user.copyIssueInfo && user.copyIssueInfo.length >= 5) {
            req.flash("warning", "user can't  issue more than 5 documents at a time");
            return res.redirect("back");
        }

        const copy = await Copy.findOne({ cote: copy_num })



        // document.copies.map(async (copy) => {
        //     if (copy.isAvailable == true) {
        //         copy_id = copy._id
        //         await Copy.findByIdAndUpdate(copy._id, { isAvailable: false }) //         return
        //     }
        // })
        if (copy.isAvailable === false) {
            req.flash('error', "Ce exemplaire n'est pas disponible");
            return res.redirect('back');
        }
        copy.isAvailable = false
        const document = await Document.findById(copy.doc_id)
        console.log(copy)
        const issue = new Issue({
            issueStatus: "reserve",
            document_info: {
                doc_id: copy.doc_id,
                copy_id: copy._id
            },
            user_id: {
                id: user._id,
                username: user.username,
            },
            admin_id: {
                id: await User.findOne({ "username": req.session.passport.user }),
                username: req.session.passport.user
            }
        })
        await document.updateOne({ $inc: { "availableCopies": -1 } })
        // putting issue record on individual user document
        user.copyIssueInfo.push(copy._id);

        // logging the activity
        const activity = new Activity({
            info: {
                id: document._id,
                titre: document.titre,
            },
            categorie: "Issue",
            time: {
                id: issue._id,
                issueDate: issue.document_info.issueDate,
                returnDate: issue.document_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });
        await user.save()
        await document.save()
        await issue.save()
        await activity.save()
        await copy.save()
        res.redirect('/admin/issues/1')
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}
