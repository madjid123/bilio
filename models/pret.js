const mongoose = require("mongoose");
const Exemplaire = require("./exemplaire")
const User = require("./user")
const Document = require('./document');
const pretSchema = new mongoose.Schema({
    pretType: String,
    pretStatut: {
        type: String,
        enum: ["retourner", "prolonoger", "en cours", "reserver", "retard"]
    },
    document_info: {
        doc_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },
        exemplaire_id: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exemplaire'
            },
            cote: String

        },
        dateDePret: {
            type: Date,
            default: Date.now()
        },
        //Date.now() + 7 * 24 * 60 * 60 * 1000 
        dateDeRetour: {
            type: Date
        },
        estProlonoger: {
            type: Boolean,
            default: false
        },
    },

    user_id: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        numero: String,
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

pretSchema.post(['findOne', 'findById', 'findByIdAndUpdate'], async (doc, next) => {
    if (!doc || !doc.document_info) return;
    if (Date.now() > doc.document_info.dateDeRetour && doc.pretStatut === "en cours") {
        doc.pretStatut == "retard"
        doc.save()
    }
    next()
})
pretSchema.post(['find'], async (docs) => {
    if (docs) {
        docs.forEach(async doc => {
            if (doc.pretStatut === "retourner") {}
            if (Date.now() > doc.document_info.dateDeRetour && doc.pretStatut === "en cours") {
                doc.pretStatut = "retard"
                doc.save()
            }
        })
    }
})
pretSchema.pre(['save'], async function (doc, next) {
    if (doc.pretStatut === "retourner") {
        const user = await User.findById(doc.user_id.id)
    }
})

module.exports = mongoose.model("Pret", pretSchema);