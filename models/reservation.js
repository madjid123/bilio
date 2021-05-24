const mongoose = require('mongoose')

const ReservationSchema = new mongoose.Schema({
    doc_info: {
        copy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Copy" },
        reservationDate: { type: mongoose.Schema.Types.Date, default: Date.now() }

    },
    user_info: {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    //les reservations sans confirmation seront automatiquement annuler apres 3 jours.,

    created_at: { type: mongoose.Schema.Types.Date, default: Date.now(), index: { expires: 3 * 24 * 60 * 60 } }

})

module.exports = mongoose.model("Reservation", ReservationSchema)