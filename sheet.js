const http = require('http')

const find = require('lodash.find')
const foreach = require('lodash.foreach')
const map = require('lodash.map')
const moment = require('moment')

const announcementQuery = require('./announcementQuery')
const css = require('./css')
const formatTimes = require('./formatTimes')
const times = require('./times')
const trains = require('./trains')

function sheet(outgoingResponse, branch, direction) {
    const location = {
        c: ['Äs', 'Åbe', 'Sst', 'Cst', 'Ke'],
        n: ['So', 'Udl', 'Hel', 'Sol', 'Hgv', 'Nvk', 'R', 'Upv', 'Arnc'],
        s: ['Tul', 'Flb', 'Hu', 'Sta'],
        e: ['Hnd', 'Skg', 'Tåd', 'Fas'],
        w: ['Sub', 'Spå', 'Bkb', 'Jkb']
    }

    const locations = location[branch]
    const postData = announcementQuery('1:00:00', locations, direction)

    const options = {
        hostname: 'api.trafikinfo.trafikverket.se',
        port: 80,
        path: '/v1.1/data.json',
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(postData)
        }
    }

    const outgoingRequest = http.request(options, handleResponse)
    outgoingRequest.on('error', handleError)
    outgoingRequest.write(postData)

    outgoingRequest.end()

    function handleResponse(incomingResponse) {
        let body = ''
        incomingResponse.setEncoding('utf8')
        incomingResponse.on('data', chunk => body += chunk)
        incomingResponse.on('end', done)

        function done() {
            // console.log(body)
            const activityTypes = ['Ankomst', 'Avgang']
            const announcements = JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement
            const trainIds = trains(announcements, moment())
            const ts = times(announcements)

            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write('<title>Sheet</title>')
            outgoingResponse.write(`<style>${css()}</style>`)
            outgoingResponse.write('<table>')
            outgoingResponse.write('<tr><th>')

            foreach(trainIds, trainId => outgoingResponse.write(`<th>${locationName(trainId)}<br>${trainId}`))

            if (direction === 's')
                locations.reverse()

            locations.forEach(station => {
                activityTypes.forEach(activityType => {
                    outgoingResponse.write('<tr>')
                    outgoingResponse.write(`<td class=${activityType}>${activityType.substr(0, 3)} ${station}`)

                    foreach(trainIds, trainId =>
                        outgoingResponse.write(
                            `<td class=${activityType}>${formatTimes(ts[station + trainId + activityType])}`))
                })
            })

            outgoingResponse.write('</table>')

            outgoingResponse.end()

            function locationName(trainId) {
                return map(find(announcements, {AdvertisedTrainIdent: trainId}).ToLocation, 'LocationName')
            }
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

module.exports = sheet
