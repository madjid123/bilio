const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  numero: String,
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
  categorie: String,
  addresse: String,
  password: String,
  dateDadhesion: { type: Date, default: Date.now() },
  copyIssueInfo: [
    {
      document_info: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Issue",
        },
      },
    },
  ],
  address: String,
  image: {
    type: String,
    default: "",
  },
  violationFlag: { type: Boolean, default: false },
  fines: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
