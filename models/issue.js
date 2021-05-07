const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    issueType: String,
    issueStatus: String,
    document_info: {
        doc_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
        },
        copy_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Copy'
        },
        issueDate: { type: Date, default: Date.now() },
        //Date.now() + 7 * 24 * 60 * 60 * 1000 
        returnDate: {
            type: Date, default: Date.now() + 7 * 24 * 60 * 60 * 1000
        },
        isRenewed: { type: Boolean, default: false },
    },

    user_id: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        username: String,
    },
    admin_id: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String
    }
});


module.exports = mongoose.model("Issue", issueSchema);