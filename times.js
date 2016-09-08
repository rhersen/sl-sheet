const zipobject = require('lodash.zipobject')

module.exports = (announcements) =>
    zipobject(
        announcements.map(a => `${a.LocationSignature}${a.AdvertisedTrainIdent}${a.ActivityType}`),
        announcements.map(a => a.AdvertisedTimeAtLocation))
