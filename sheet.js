const http = require('http')

const announcementQuery = require('./announcementQuery')
const css = require('./css')

function sheet(outgoingResponse) {
    const postData = announcementQuery(`
        <OR>
          <EQ name='LocationSignature' value='Tul' />
          <EQ name='LocationSignature' value='Sta' />
        </OR>
        <GT name='AdvertisedTimeAtLocation' value='$dateadd(-0:10:00)' />
        <LT name='AdvertisedTimeAtLocation' value='$dateadd(0:10:00)' />`
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
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write('<title>Sheet</title>')
            outgoingResponse.write(`<style>${css()}</style>`)

            outgoingResponse.write('<table>')

            JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement.forEach(writeRow)

            outgoingResponse.write('</table>')

            outgoingResponse.end()

            function writeRow(data) {
                outgoingResponse.write(`<tr><td>${data.AdvertisedTrainIdent}`)
                outgoingResponse.write(`<td>${data.ToLocation.map(l => l.LocationName).join(', ')}`)
                outgoingResponse.write(`<td>${data.ActivityType}`)
                outgoingResponse.write(`<td>${data.LocationSignature}`)
                outgoingResponse.write(`<td>${data.AdvertisedTimeAtLocation}`)
                outgoingResponse.write(`<td>${data.EstimatedTimeAtLocation}`)
                outgoingResponse.write(`<td>${data.TimeAtLocation}`)
            }
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

module.exports = sheet
