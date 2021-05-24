const mongoose = require('mongoose')

const penaliteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    montant: Number,
    copy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Copy"
    },
    date: {
        type: mongoose.Schema.Types.Date,
        default: Date.now()
    },

})
module.exports = mongoose.model("Penalite", penaliteSchema)