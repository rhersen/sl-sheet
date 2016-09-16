const css = require('./css')

module.exports = function (outgoingResponse) {
    outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    outgoingResponse.write('<!DOCTYPE html>')
    outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
    outgoingResponse.write('<title>Sheet</title>')
    outgoingResponse.write(`<style>${css()}</style>`)
    outgoingResponse.write('<div><a href="/n">norrut</a></div>')
    outgoingResponse.write('<div><a href="/s">söderut</a></div>')
    outgoingResponse.end()
}
