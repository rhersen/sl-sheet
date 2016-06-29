const atob = require('atob')

const css = require('./css')
const ingela = require('./ingela')
const stations = require('./stations')
const train = require('./train')

function requestListener(incomingRequest, outgoingResponse) {
    let match
    const url = decodeURIComponent(incomingRequest.url)

    if (/favicon.ico/.test(url))
        favicon(outgoingResponse)
    else if (/api.stations/.test(url))
        stations(writeStations)
    else if (match = /(\d\d\d\d)/.exec(url))
        train(match[1], outgoingResponse)
    else
        ingela(outgoingResponse)

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

require('http').createServer(requestListener).listen(1337, '127.0.0.1')
