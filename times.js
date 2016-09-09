const keyby = require('lodash.keyby')

module.exports = (announcements) =>
    keyby(announcements, a => `${a.LocationSignature}${a.AdvertisedTrainIdent}${a.ActivityType}`)
