const filter = require('lodash.filter')
const map = require('lodash.map')
const uniq = require('lodash.uniq')

module.exports = (announcements) =>
    uniq(map(announcements, 'AdvertisedTrainIdent'))
        .sort((id1, id2) => {
            const a1 = filter(announcements, {AdvertisedTrainIdent: id1})

            for (let i = 0; i < a1.length; i++) {
                const a2 = filter(announcements, {
                    AdvertisedTrainIdent: id2,
                    LocationSignature: a1[i].LocationSignature,
                    ActivityType: a1[i].ActivityType
                })

                const time1 = a1[i].AdvertisedTimeAtLocation

                for (let j = 0; j < a2.length; j++) {
                    const time2 = a2[j].AdvertisedTimeAtLocation
                    if (time1 < time2) return -1
                    if (time1 > time2) return 1
                }
            }
        })
