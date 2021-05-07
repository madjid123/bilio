const mongoose = require('mongoose')


const CopySchema = new mongoose.Schema({
    doc_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Document', required: true },
    cote: String,
    localization: String,
    status: String,
    material: String,
    landtype: String,
    isAvailable: { type: Boolean, default: true }

})

module.exports = mongoose.model("Copy", CopySchema)