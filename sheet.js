const http = require('http')

const announcementQuery = require('./announcementQuery')
const css = require('./css')
const formatTimes = require('./formatTimes')
const times = require('./times')
const trains = require('./trains')

function sheet(outgoingResponse) {
    const locations = [
        'Tul', 'Flb', 'Hu', 'Sta'
    ]

    const postData = announcementQuery(`
        <LIKE name='AdvertisedTrainIdent' value='/[02468]$/' />
        <GT name='AdvertisedTimeAtLocation' value='$dateadd(-0:32:00)' />
        <LT name='AdvertisedTimeAtLocation' value='$dateadd(0:32:00)' />`,
        locations
    )

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
            trainIds.forEach(trainId => outgoingResponse.write(`<th>${trainId}`))

            locations.forEach(station => {
                activityTypes.forEach(activityType => {
                    outgoingResponse.write('<tr>')
                    outgoingResponse.write(`<td>${activityType.substr(0, 3)} ${station}`)
                    trainIds.forEach(trainId =>
                        outgoingResponse.write(`<td>${formatTimes(ts[station + trainId + activityType])}`))
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
