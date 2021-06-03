const mongoose = require('mongoose')


const exemplaireSchema = new mongoose.Schema({
    doc_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Document', required: true },
    cote: String,
    localisation: String,
    statut: String,
    support: String,
    typePret: String,
    estDisponible: { type: Boolean, default: true }

})

module.exports = mongoose.model("Exemplaire", exemplaireSchema)