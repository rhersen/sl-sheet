const difference = require('lodash.difference')
const filter = require('lodash.filter')
const find = require('lodash.find')
const map = require('lodash.map')
const moment = require('moment')
const uniq = require('lodash.uniq')

function trains(announcements, now) {
    const lowerBound = moment(now).subtract(55, 'minutes').format()
    const upperBound = moment(now).add(55, 'minutes').format()

    return difference(ids(announcements), ids(filter(announcements, isTooEarly)), ids(filter(announcements, isTooLate)))
        .sort(byAdvertisedTime)

    function isTooEarly(a) {
        return a.AdvertisedTimeAtLocation < lowerBound
    }

    function isTooLate(a) {
        return a.AdvertisedTimeAtLocation > upperBound
    }

    function byAdvertisedTime(leftId, rightId) {
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
    }
}

function ids(announcements) {
    return uniq(map(announcements, 'AdvertisedTrainIdent'))
}

function compareTimes(a1, a2) {
    const time1 = a1.AdvertisedTimeAtLocation
    const time2 = a2.AdvertisedTimeAtLocation
    if (time1 < time2) return -1
    if (time1 > time2) return 1
    return 0
}

module.exports = trains
