require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./user')
const MongoClient = require('mongodb').MongoClient
const { MongoCron } = require('mongodb-cron');
const mongo = new MongoClient(process.env.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })


const suspensionSchema = new mongoose.Schema({
    user: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        numero: String

    },
    motif: String,
    duree: Number,
    expires: Date,
    expireAt: Date

})
//suspensionSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 })

suspensionSchema.post(['remove', 'findOneAndRemove', 'deleteOne', 'deleteMany', 'findOneAndDelete'], async (doc, next) => {
    console.log(doc)
    await User.findByIdAndUpdate(doc.user.id, { $set: { violationFlag: false } })
    console.log("done deleting")
    next()
})
suspensionSchema.post('save', async (doc, next) => {
    console.log(doc)
    await User.findByIdAndUpdate(doc.user.id, {
        $set: {
            violationFlag
                : true
        }
    })
    next()
    console.log("done")
})

const runjob = async () => {
    await mongo.connect()
    const db = mongo.db('library')
    const collection = db.collection('suspensions')

    const cron = new MongoCron({
        collection, // a collection where jobs are stored
        onDocument: async (doc) => console.log(doc), // triggered on job processing
        onError: async (err) => console.log(err), // triggered on error
    });

    cron.start(); // start processing
    const job = await collection.insertOne({
        interval: '* * * * * *', // every second
    });
}
runjob()
module.exports = mongoose.model("Suspension", suspensionSchema)