const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");
const Suspension = require("./suspension");
const userSchema = new mongoose.Schema({
  numero: String,
  type: {
    type: String,
    enum: ['admin', 'bibliothecaire', 'lecteur'],
    required: true
  },
  prenom: {
    type: String,
    trim: true,
  },
  nom: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  dateDeNaissance: Date,

  email: {
    type: String,
    trim: true,
  },
  categorie: {
    type: String,
    enum: ['Enseignant', 'Etudiant', 'Chercheur']
  },
  addresse: String,
  password: String,
  dateDadhesion: { type: Date, default: Date.now() },
  copypretInfo: [
    {
      document_info: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "pret",
        },
      },
      copy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Copy' }
    },
  ],
  image: {
    type: String,
    default: "",
  },
  violationFlag: { type: Boolean, default: false },
  fines: { type: Number, default: 0 },
  estAdmin: { type: Boolean, default: false },
  estInscrit: { type: Boolean, default: false },
  suspension_id: { type: mongoose.Schema.Types.ObjectId, ref: "Suspension" }
});

userSchema.plugin(passportLocalMongoose);
//, 'findOneAndDelete', 'findOneAndRemove', 'findOneAndUpdate'
userSchema.post(['find', 'findOne'], async function (doc, next) {
  if (doc && doc.length) {
    const docs = doc
    docs.map(async (doc) => {
      let exist = await Suspension.exists({ _id: doc.suspension_id })
      if (exist) {
        if (doc.violationFlag === false) {
          doc.violationFlag = true;
          await doc.save()
        }
      }
      else {
        if (doc.violationFlag === true) {
          doc.violationFlag = false;
          doc.suspension_id = undefined;
          await doc.save()
        }
      }

    })
  } else {
    if (doc && doc.suspension_id) {
      let exist = await Suspension.exists({ _id: doc.suspension_id })
      if (exist) {
        if (doc.violationFlag === false) {
          doc.violationFlag = true;
          await doc.save()
        }
      }
      else {
        if (doc.violationFlag === true) {
          doc.violationFlag = false;
          doc.suspension_id = undefined;
          await doc.save()
        }
      }
    }
  }
  next()

  //console.log(i)

}
)
userSchema.pre('save', async function () {
  if (this.suspension_id) {

  }
})

module.exports = mongoose.model("User", userSchema);
