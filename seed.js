const Document = require('./models/document.js');
const faker = require('faker');
const category = ["Science", "Biology", "Physics", "Chemistry", "Novel", "Travel", "Cooking", "Philosophy", "Mathematics", "Ethics", "Technology"];
const Copy = require('./models/copy.js');
const author = [];
for (let i = 0; i < 11; i++) {
    author.push(faker.name.findName());
}
async function seed(limit) {
    for (let i = 0; i < 11; i++) {
        author.push(faker.name.findName());
    }
    for (let i = 0; i < limit; i++) {
        let index1 = Math.floor(Math.random() * Math.floor(11));
        let index2 = Math.floor(Math.random() * Math.floor(11));
        try {
            const document = new Document({
                titre: faker.lorem.words(),
                ISBN: faker.random.uuid(),
                stock: 0,
                auteur: author[index2],
                resume: faker.lorem.paragraphs(3),
                categorie: category[index1],
                lang: faker.lorem.word()
            });
            await document.save();
            for (let j = 0; j < 6; j++) {
                const copy = new Copy({
                    cote: faker.lorem.words(),
                    doc_id: document._id,
                    status: faker.lorem.word(),
                    localization: faker.lorem.word(),
                    landtype: faker.lorem.sentence(),
                    material: faker.lorem.sentence()
                })
                await copy.save()
                await document.updateOne({ $inc: { "availableCopy": 1, "stock": 1 }, $addToSet: { copies: [copy._id] } })
            }
        } catch (err) {
            console.log("Error at creating documents");
        }
    }
}

module.exports = seed;