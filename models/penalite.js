const mongoose = require('mongoose')

const penaliteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    numero : String,

    montant: Number,
    note : String,
   
    dateDePenalite: {
        type: mongoose.Schema.Types.Date,
        default: Date.now()
    },
    admin_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    etat :{
        type:String,
        enum : ['paye','en cours'],
        default : 'en cours'
    }
    
})
module.exports = mongoose.model("Penalite", penaliteSchema)