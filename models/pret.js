const mongoose = require("mongoose");
const Exemplaire = require("./exemplaire")
Exemplaire
const pretSchema = new mongoose.Schema({
    pretType: String,
    pretStatus: String,
    document_info: {
        doc_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },
        exemplaire_id: {
            id :{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exemplaire'},
            cote : String

        },
        pretDate: { type: Date, default: Date.now() },
        //Date.now() + 7 * 24 * 60 * 60 * 1000 
        returnDate: {
            type: Date
        },
        isRenewed: { type: Boolean, default: false },
    },

    user_id: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        numero : String,
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

pretSchema.post(['remove', 'delete', 'deleteOne'], async (doc) => {
    await Exemplaire.findByIdAndUpdate(doc.document_info.exemplaire_id.id, { $set: { estDisponible: true } })
})
const schedule = require('node-schedule');
let i = 0
// une fonction executer chaque jour a 00:00:00 pour mettre la base a jour
// const j = schedule.scheduleJob("* * 0-4 * * *", function () {
//     console.log(new Date());
// });
pretSchema.post(['find', 'findById'], async (doc) => {

})
module.exports = mongoose.model("Pret", pretSchema);