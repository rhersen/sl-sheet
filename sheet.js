const http = require('http')

const foreach = require('lodash.foreach')

const announcementQuery = require('./announcementQuery')
const css = require('./css')
const formatTimes = require('./formatTimes')
const times = require('./times')
const trains = require('./trains')

function sheet(outgoingResponse, direction) {
    const locations = [
        'Tul', 'Flb', 'Hu', 'Sta'
        // 'Äs', 'Åbe', 'Sst', 'Cst', 'Ke'
    ]

    const postData = announcementQuery('0:36:00', locations, direction)

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
            const activityTypes = ['Ankomst', 'Avgang']
            const announcements = JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement
            const trainIds = trains(announcements)
            const ts = times(announcements)

            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write('<title>Sheet</title>')
            outgoingResponse.write(`<style>${css()}</style>`)
            outgoingResponse.write('<table>')
            outgoingResponse.write('<tr><th>')

            foreach(trainIds, (location, trainId) =>
                outgoingResponse.write(`<th>${trainId} ${location}`))

            if (direction === 's')
                locations.reverse()

            locations.forEach(station => {
                activityTypes.forEach(activityType => {
                    outgoingResponse.write('<tr>')
                    outgoingResponse.write(`<td class=${activityType}>${activityType.substr(0, 3)} ${station}`)

                    foreach(trainIds, (location, trainId) =>
                        outgoingResponse.write(
                            `<td class=${activityType}>${formatTimes(ts[station + trainId + activityType])}`))
                })
            })

            outgoingResponse.write('</table>')

            outgoingResponse.end()
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

module.exports = sheet
