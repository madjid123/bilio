const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    info: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
        },
        titre: String,
    },


    categorie: String,

    time: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Issue",
        },
        returnDate: Date,
        issueDate: Date,
    },

    user_id: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
    admin: String,
    fine: {
        amount: Number,
        date: Date,
    },

    entryTime: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("Activity", activitySchema);