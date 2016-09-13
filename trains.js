const zipobject = require('lodash.zipobject')

module.exports = (announcements) => {
    return zipobject(
        announcements.map(a => a.AdvertisedTrainIdent),
        announcements.map(a => a.ToLocation.map(to => to.LocationName).join(',')))
}
