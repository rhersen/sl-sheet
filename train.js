const http = require('http')

const announcementQuery = require('./announcementQuery')
const css = require('./css')
const formatLatestAnnouncement = require('./formatLatestAnnouncement')
const stations = require('./stations')

let stationNames = false

function train(id, outgoingResponse) {
    if (!stationNames)
        stations(data => stationNames = data)

    const postData = announcementQuery(`
        <EQ name='AdvertisedTrainIdent' value='${id}' />
        <GT name='TimeAtLocation' value='$dateadd(-0:12:00)' />
        <LT name='TimeAtLocation' value='$dateadd(0:12:00)' />`)

    const options = {
        hostname: 'api.trafikinfo.trafikverket.se',
        port: 80,
        path: '/v1.1/data.json',
        method: 'POST',
        headers: {
            'Content-Length': Buffer.byteLength(postData),
            'Cache-Control': 'no-cache'
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
            const announcements = JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write(`<title>${id}</title>`)
            outgoingResponse.write(`<style>${css()}</style>`)

            outgoingResponse.write('<p>')
            outgoingResponse.write(formatLatestAnnouncement(announcements, stationNames))
            outgoingResponse.write('</p>')

            outgoingResponse.end()
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

module.exports = train
