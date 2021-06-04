const Document = require('./models/document.js');
const faker = require('faker');
const category = ["Science", "Biologie", "Physique", "Chimie", "Economie" , "Philosophie", "Mathematique", "Programmation","Génie Civile","Electronique","Réseaux"];
const Exemplaire = require('./models/exemplaire.js');
const TypePret = ['prêt externe', 'consultation sur place']
const typeDocument = ['Livre', 'Thèse','Article','Autre']
const localisation = ['st', 'bc','se']
const author = [];
for (let i = 0; i < 11; i++) {
    author.push(faker.name.findName());
}
async function seed(limit) {
    for (let i = 0; i < 11; i++) {
        author.push(faker.name.findName());
    }
    for (let i = 0; i < limit; i++) {
        let index1 = Math.floor(Math.random() * Math.floor(category.length));
        let index2 = Math.floor(Math.random() * Math.floor(category.length));
        let index4 = Math.floor(Math.random() * Math.floor(localisation.length));
        let index3 = Math.floor(Math.random() * Math.floor(typeDocument.length));
        try {
            const document = new Document({
                titre: faker.lorem.words(),
                compTitre : faker.lorem.words(),
                ISBN: faker.random.uuid(),
                stock: 0,
                edition: faker.lorem.words(),
                annee : Math.floor( Math.random() * 35) + 1980 ,
                auteur: author[index2],
                type : typeDocument[index3],
                resume: faker.lorem.paragraphs(3),
                categorie: category[index1],
                vedette : faker.lorem.words(),
                note : faker.lorem.words(),
                lang: faker.lorem.word()
            });
            await document.save();
            for (let j = 0; j < 6; j++) {
                const exemplaire = new Exemplaire({
                    cote: faker.lorem.words(),
                    doc_id: document._id,
                    statut: faker.lorem.word(),
                    localisation: localisation[index4],
                    typePret: TypePret[Math.floor(Math.random() * Math.floor(TypePret.length))],
                    support: faker.lorem.sentence()
                })
                await exemplaire.save()
                await document.updateOne({ $inc: { "ExemplairesDisponible": 1, "stock": 1 }, $addToSet: { exemplaires: [exemplaire._id] } })
            }
        } catch (err) {
            console.error(err)
            console.log("Error while creating documents");
        }

    }
}

module.exports = seed;