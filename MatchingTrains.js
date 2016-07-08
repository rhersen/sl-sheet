const moment = require('moment')

function getNorthbound(as) {
    const sub = as.filter(a => a.LocationSignature === 'Sub').filter(a => a.ActivityType === 'Ankomst')
    const tul = as.filter(a => a.LocationSignature === 'Tul').filter(a => a.ActivityType === 'Avgang')

    return sub.filter(northbound)
        .map(ankomst =>
            selectAvgang(tul.filter(northbound).filter(avgang => minutes(ankomst, avgang) > 29), ankomst))

    function northbound(ankomst) {
        return /[02468]$/.test(ankomst.AdvertisedTrainIdent)
    }

    function selectAvgang(avgangs, ankomst) {
        if (avgangs.length) {
            const selected = avgangs.reduce((prev, cur) => {
                const diff1 = minutes(ankomst, prev)
                const diff2 = minutes(ankomst, cur)
                return diff2 < diff1 ? cur : prev
            })

            return {ankomst: ankomst, avgang: selected}
        }
    }

    function minutes(ankomst, avgang) {
        const ank = ankomst.AdvertisedTimeAtLocation
        const avg = avgang.AdvertisedTimeAtLocation
        const ankm = moment(ank)
        const avgm = moment(avg)
        return ankm.diff(avgm, 'minutes')
    }
}

module.exports = {
    getNorthbound: getNorthbound
}
