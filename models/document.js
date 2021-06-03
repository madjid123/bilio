const mongoose = require("mongoose");
const Exemplaire = require("./exemplaire");
const documentSchema = new mongoose.Schema({
    titre: String,
    compTitre: String,
    ISBN: String,
    auteur: String,
    resume: String,
    categorie: String,
    type: String,
    lang: String,
    edition: String,
    annee: Number,
    note: String,
    vedettes: String,
    exemplaires: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exemplaire"
    }
    ],
    ExemplairesDisponible: { type: Number, default: 0 },
    stock: { type: Number, default: 0 }
});
documentSchema.post('remove', async (doc) => {
    await Exemplaire.deleteMany({ doc_id: doc._id })
})
module.exports = mongoose.model("Document", documentSchema);