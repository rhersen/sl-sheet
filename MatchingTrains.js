const moment = require('moment')

function getNorthbound(as) {
    function isLocation(s) {
        return a => a.LocationSignature === s
    }

    function isActivity(s) {
        return a => a.ActivityType === s
    }

    const sub = as.filter(isLocation('Sub')).filter(isActivity('Ankomst')).filter(northbound)
    const tul = as.filter(isLocation('Tul')).filter(isActivity('Avgang')).filter(northbound)

    return sub
        .map(ankomst =>
            selectAvgang(tul.filter(avgang => minutes(ankomst, avgang) > 29), ankomst))

    function northbound(ankomst) {
        return /[02468]$/.test(ankomst.AdvertisedTrainIdent)
    }

    function selectAvgang(avgangs, ankomst) {
        if (avgangs.length)
            return {
                ankomst: ankomst,
                avgang: avgangs.reduce(isTimeBefore)
            }
    }

    function isTimeBefore(a, b) {
        return moment(a.AdvertisedTimeAtLocation).isBefore(moment(b.AdvertisedTimeAtLocation)) ? b : a
    }

    function minutes(ankomst, avgang) {
        const ank = moment(ankomst.AdvertisedTimeAtLocation)
        const avg = moment(avgang.AdvertisedTimeAtLocation)
        return ank.diff(avg, 'minutes')
    }
}

module.exports = {
    getNorthbound: getNorthbound
}
