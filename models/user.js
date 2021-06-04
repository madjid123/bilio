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
  dateDadhesion: {
    type: Date,
    default: Date.now()
  },
  exemplairepretInfo: [{
    document_info: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pret",
      },
    },
    exemplaire_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'exemplaire'
    }
  }, ],
  image: {
    type: String,
    default: "",
  },
  violationFlag: {
    type: Boolean,
    default: false
  },
  estAdmin: {
    type: Boolean,
    default: false
  },
  estInscrit: {
    type: Boolean,
    default: false
  },
  suspension_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Suspension"
  },
  avertissment : {
    type : Number, 
    default : 0
  }
});

userSchema.plugin(passportLocalMongoose);

userSchema.post('find' ,async function (docs, next) {

        docs.map(async (doc) => {
          let exist = await Suspension.exists({
            _id: doc.suspension_id
          })
          if (exist) {
            if (doc.violationFlag === false) {
              doc.violationFlag = true;
              await doc.save()
            } } 
            else {
                doc.violationFlag = false;
                doc.suspension_id = undefined;
                await doc.save()
            }
          }

         

        )
        
 next()
      })//'
userSchema.post('findOne','findById' ,async function (doc ) {

  if (doc ) {
    let exist = await Suspension.exists({
      _id: doc.suspension_id
    })

    if (exist) {
      if (doc.violationFlag === false) {
        doc.violationFlag = true;
        await doc.save()
      }
    } else {
      if (doc.violationFlag === true) {
        doc.violationFlag = false;
        doc.suspension_id = undefined;
        await doc.save()
      }
    }
  }

})



        module.exports = mongoose.model("User", userSchema);