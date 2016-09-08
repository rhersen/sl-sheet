const uniq = require('lodash.uniq')

module.exports = (announcements) =>
    uniq(announcements.map(announcement => announcement.AdvertisedTrainIdent))
