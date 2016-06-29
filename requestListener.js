const atob = require('atob')

const css = require('./css')
const ingela = require('./ingela')
const train = require('./train')

function requestListener(incomingRequest, outgoingResponse) {
    let match
    const url = decodeURIComponent(incomingRequest.url)

    if (/favicon.ico/.test(url))
        favicon(outgoingResponse)
    else if (match = /(\d\d\d\d)/.exec(url))
        train(match[1], outgoingResponse)
    else
        ingela(outgoingResponse)
}

function favicon(response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end(atob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T'))
}

module.exports = requestListener
