const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: String,
    auteur: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },

    document: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
        },
        titre: String,
    },

    date: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Comment", commentSchema);