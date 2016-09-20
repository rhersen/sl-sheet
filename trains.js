const uniq = require('lodash.uniq')

module.exports = (announcements) => {
    return uniq(announcements.map(a => a.AdvertisedTrainIdent))
}
