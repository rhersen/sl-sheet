const filter = require('lodash.filter')
const uniq = require('lodash.uniq')

function atSameLocation(train1, train2) {
    return train1.LocationSignature === train2.LocationSignature && train1.ActivityType === train2.ActivityType
}
module.exports = (announcements) => {
    const ids = uniq(announcements.map(a => a.AdvertisedTrainIdent))

    ids.sort((id1, id2) => {
        const a1 = filter(announcements, {AdvertisedTrainIdent: id1})
        const a2 = filter(announcements, {AdvertisedTrainIdent: id2})

        for (let i = 0; i < a1.length; i++) {
            const train1 = a1[i]

            for (let j = 0; j < a2.length; j++) {
                const train2 = a2[j]

                if (atSameLocation(train1, train2)) {
                    const time1 = train1.AdvertisedTimeAtLocation
                    const time2 = train2.AdvertisedTimeAtLocation
                    if (time1 < time2) return -1
                    if (time1 > time2) return 1
                }
            }
        }
    })

    return ids
}
