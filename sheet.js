const http = require('http')

const announcementQuery = require('./announcementQuery')
const htmlTable = require('./htmlTable')

function sheet(outgoingResponse, branch, direction) {
    const location = {
        c: ['Äs', 'Åbe', 'Sst', 'Cst', 'Ke'],
        n: ['So', 'Udl', 'Hel', 'Sol', 'Hgv', 'Nvk', 'R', 'Upv', 'Arnc'],
        s: ['Rön', 'Tu', 'Tul', 'Flb', 'Hu', 'Sta'],
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
        incomingResponse.on('end', () => {
            if (direction === 's')
                locations.reverse()

            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'})
            outgoingResponse.write(htmlTable(JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement, locations))
            outgoingResponse.end()
        })
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

module.exports = sheet
