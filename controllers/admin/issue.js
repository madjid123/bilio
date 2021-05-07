
// importing models
const Document = require('../models/document');
const User = require('../models/user');
const Copy = require('../models/copy');
const Activity = require('../models/activity');
const Issue = require('../models/issue');


// admin -> create an issue book for given user
exports.postIssueDocument = async (req, res, next) => {
    try {
        const user_id = req.params.user_id
        const doc_id = req.params.doc_id

        const user = await User.findById(user_id)
        if (user.violationFlag) {
            req.flash("error", "You are flagged for violating rules/delay on returning documents/paying fines. Untill the flag is lifted, You can't issue any documents");
            return res.redirect("back");
        }

        if (user.documentIssueInfo.length >= 5) {
            req.flash("warning", "user can't  issue more than 5 documents at a time");
            return res.redirect("back");
        }

        const document = await Document.findById(doc_id).populate('copies');
        var copy_id = null
        document.copies.map(async (copy) => {
            if (copy.isAvailable == true) {
                copy_id = copy._id
                await Copy.findByIdAndUpdate(copy._id, { isAvailable: false })
                return
            }
        })

        const issue = new Issue({
            issueStatus: "reserve",
            document_info: {
                doc_id: document._id,
                copy_id: copy_id
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
        user.documentIssueInfo.push(document._id);

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
        user.save()
        document.save()
        issue.save()
        activity.save()
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}