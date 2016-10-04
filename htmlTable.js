const find = require('lodash.find')
const map = require('lodash.map')
const moment = require('moment')

const css = require('./css')
const formatTimes = require('./formatTimes')
const times = require('./times')
const trains = require('./trains')

function htmlTable(announcements, locations) {
    const trainIds = trains(announcements, moment())
    const activityTypes = ['Ankomst', 'Avgang']
    const ts = times(announcements)

    return [
        '<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Sheet</title>',
        `<style>${css()}</style>`,
        '<table><tr><th>']
        .concat(
            map(trainIds,
                id =>
                    `<th>${map(find(announcements, {AdvertisedTrainIdent: id}).ToLocation, 'LocationName')}<br>${id}`),
            map(locations,
                location =>
                    map(activityTypes,
                        activityType =>
                        `<tr><td class=${activityType}>${activityType.substr(0, 3)} ${location}` +
                        map(trainIds,
                            id =>
                                `<td class=${activityType}>${formatTimes(ts[location + id + activityType])}`)
                            .join('\n'))
                        .join('\n')))
        .join('\n')
}

module.exports = htmlTable
