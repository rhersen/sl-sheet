const filter = require('lodash.filter')
const find = require('lodash.find')
const map = require('lodash.map')
const uniq = require('lodash.uniq')

function trains(announcements) {
    return uniq(map(announcements, 'AdvertisedTrainIdent'))
        .sort((leftId, rightId) => {
            const left = filter(announcements, {AdvertisedTrainIdent: leftId})

            for (let i = 0; i < left.length; i++) {
                const right = find(announcements, {
                    AdvertisedTrainIdent: rightId,
                    LocationSignature: left[i].LocationSignature,
                    ActivityType: left[i].ActivityType
                })

                if (right)
                    return compareTimes(left[i], right)
            }
        })
}

function compareTimes(a1, a2) {
    const time1 = a1.AdvertisedTimeAtLocation
    const time2 = a2.AdvertisedTimeAtLocation
    if (time1 < time2) return -1
    if (time1 > time2) return 1
    return 0
}

module.exports = trains
