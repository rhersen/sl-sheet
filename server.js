const atob = require('atob')

const stations = require('./stations')
const sheet = require('./sheet')

function requestListener(incomingRequest, outgoingResponse) {
    const url = decodeURIComponent(incomingRequest.url)

    if (/favicon.ico/.test(url))
        favicon(outgoingResponse)
    else if (/api.stations/.test(url))
        stations(writeStations)
    else
        sheet(outgoingResponse)

    function writeStations(data) {
        outgoingResponse.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'})
        outgoingResponse.write(JSON.stringify(data))
        outgoingResponse.end()
    }
}

function favicon(response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end(atob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T'))
}

require('http').createServer(requestListener).listen(1338, '127.0.0.1')
