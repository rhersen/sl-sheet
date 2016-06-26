const http = require('http')
const atob = require('atob')
const moment = require('moment')

function requestListener(incomingRequest, outgoingResponse) {
    if (/favicon.ico/.test(decodeURIComponent(incomingRequest.url)))
        favicon(outgoingResponse)
    else
        ingela(outgoingResponse)
}

function ingela(outgoingResponse) {
    const postData = query()
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

    function query() {
        return `<REQUEST>
     <LOGIN authenticationkey='cfdeb57c80374fcd80ca811d2bcb561a' />
     <QUERY objecttype='TrainAnnouncement' orderBy='AdvertisedTimeAtLocation'>
      <FILTER>
       <AND>
        <IN name='ProductInformation' value='Pendeltåg' />
        <NE name='Canceled' value='true' />
        <OR>
         <AND>
          <EQ name='ActivityType' value='Avgang' />
          <EQ name='LocationSignature' value='Tul' />
         </AND>
         <AND>
          <EQ name='ActivityType' value='Ankomst' />
          <EQ name='LocationSignature' value='Sub' />
         </AND>
        </OR>
        <AND>
         <GT name='AdvertisedTimeAtLocation' value='$dateadd(-1:00:00)' />
         <LT name='AdvertisedTimeAtLocation' value='$dateadd(2:00:00)' />
        </AND>
       </AND>
      </FILTER>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>TimeAtLocation</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>ActivityType</INCLUDE>
     </QUERY>
    </REQUEST>`
    }

    function handleResponse(incomingResponse) {
        let body = ''
        incomingResponse.setEncoding('utf8')
        incomingResponse.on('data', chunk => body += chunk)
        incomingResponse.on('end', done)

        function done() {
            const announcements = JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement
            const sub = announcements.filter(announcement => announcement.LocationSignature === 'Sub')
            const tul = announcements.filter(announcement => announcement.LocationSignature === 'Tul')
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write('<title>Ingela</title>')

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Tullinge</caption>')
            sub.filter(northbound)
                .forEach(ankomst => selectAvgangAndWriteRow(tul.filter(northbound)
                    .filter(avgang => minutes(ankomst, avgang) > 29), ankomst))
            outgoingResponse.write('</table>')

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Sundbyberg</caption>')
            tul.filter(southbound)
                .forEach(ankomst => selectAvgangAndWriteRow(sub.filter(southbound)
                    .filter(avgang => minutes(ankomst, avgang) > 29), ankomst))
            outgoingResponse.write('</table>')

            outgoingResponse.end()

            function northbound(ankomst) {
                return /[02468]$/.test(ankomst.AdvertisedTrainIdent)
            }

            function southbound(ankomst) {
                return /[13579]$/.test(ankomst.AdvertisedTrainIdent)
            }

            function selectAvgangAndWriteRow(avgangs, ankomst) {
                if (avgangs.length)
                    writeRow(ankomst, avgangs
                        .reduce((prev, cur) => {
                            const diff1 = minutes(ankomst, prev)
                            const diff2 = minutes(ankomst, cur)
                            return diff2 < diff1 ? cur : prev
                        })
                    )
            }

            function minutes(ankomst, avgang) {
                const ank = ankomst.AdvertisedTimeAtLocation
                const avg = avgang.AdvertisedTimeAtLocation
                const ankm = moment(ank)
                const avgm = moment(avg)
                return ankm.diff(avgm, 'minutes')
            }

            function writeRow(ankomst, avgang) {
                const departureTime = avgang.AdvertisedTimeAtLocation.substring(11, 16)
                const trainIdent = ankomst.AdvertisedTrainIdent
                const minuteDiff = minutes(ankomst, avgang) - 32
                outgoingResponse.write('<tr>')
                outgoingResponse.write(`<td>${departureTime}`)
                outgoingResponse.write(`<td>${trainIdent}`)
                outgoingResponse.write(`<td>${minuteDiff} min`)
            }
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
}

function favicon(response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end(atob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T'))
}

module.exports = requestListener
