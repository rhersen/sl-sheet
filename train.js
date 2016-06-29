const http = require('http')

const key = require('./key')
const css = require('./css')
const formatLatestAnnouncement = require('./formatLatestAnnouncement')
const stations = require('./stations')

let stationNames = false

function train(id, outgoingResponse) {
    if (!stationNames)
        stations(data => stationNames = data)

    const postData = query(id)
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

function query(id) {
    return `<REQUEST>
     <LOGIN authenticationkey='${key}' />
     <QUERY objecttype='TrainAnnouncement' orderBy='TimeAtLocation'>
      <FILTER>
       <AND>
        <IN name='ProductInformation' value='Pendeltåg' />
        <NE name='Canceled' value='true' />
        <EQ name='AdvertisedTrainIdent' value='${id}' />
        <GT name='TimeAtLocation' value='$dateadd(-0:12:00)' />
        <LT name='TimeAtLocation' value='$dateadd(0:12:00)' />
       </AND>
      </FILTER>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>TimeAtLocation</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>ActivityType</INCLUDE>
     </QUERY>
    </REQUEST>`
}

module.exports = train
