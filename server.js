const atob = require('atob')

const stations = require('./stations')
const sheet = require('./sheet')

function requestListener(incomingRequest, outgoingResponse) {
    const url = decodeURIComponent(incomingRequest.url)

    let match

    if (/favicon.ico/.test(url))
        favicon(outgoingResponse)
    else if (match = /\/(\w)/.exec(url))
        sheet(outgoingResponse, match[1])
}

function favicon(response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end(atob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T'))
}

require('http').createServer(requestListener).listen(1338, '127.0.0.1')
