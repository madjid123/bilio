const mongoose = require('mongoose')

const penaliteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    montant: Number,
    exemplaire_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exemplaire"
    },
    date: {
        type: mongoose.Schema.Types.Date,
        default: Date.now()
    },

})
module.exports = mongoose.model("Penalite", penaliteSchema)