const exemplaire = require('./admin/exemplaire'),
    users = require('./admin/users'),
    dashboard = require('./admin/dashboard'),
    pret = require('./admin/pret'),
    profile = require('./admin/profile'),
    documents = require('./admin/documents'),
    document = require('./admin/document'),
    suspensions = require('./admin/suspensions'),
    penalites = require('./admin/penalites');
module.exports = {

    penalites, exemplaire, users, dashboard, pret, profile, documents, document, suspensions
}