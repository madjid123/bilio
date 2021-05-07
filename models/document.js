const mongoose = require("mongoose");
const Copy = require("./copy");
const documentSchema = new mongoose.Schema({
    titre: String,
    compTitre: String,
    ISBN: String,
    auteur: String,
    resume: String,
    categorie: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
    type: String,
    lang: String,
    editeur: String,
    annee: Number,
    note: String,
    vedettes: String,
    copies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Copy"
    }
    ],
    availableCopies: { type: Number, default: 0 },
    stock: { type: Number, default: 0 }
});
documentSchema.post('remove', async (doc) => {
    console.log(doc)
    await Copy.deleteMany({ doc_id: doc._id })
})
module.exports = mongoose.model("Document", documentSchema);