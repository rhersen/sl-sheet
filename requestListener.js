const http = require('http')
const atob = require('atob')
const moment = require('moment')

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

function train(id, outgoingResponse) {
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
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write(`<title>${id}</title>`)
            outgoingResponse.write(`<style>${css()}</style>`)

            outgoingResponse.write(`<p>${id}</p>`)

            if (announcements) {
                announcements.sort((a1, a2) => moment(a2.TimeAtLocation).diff(moment(a1.TimeAtLocation), 'minutes'))
                const announcement = announcements[0]
                outgoingResponse.write('<table>')
                outgoingResponse.write('<tr>')
                outgoingResponse.write(`<td>${announcement.ActivityType}`)
                outgoingResponse.write(`<td>${announcement.LocationSignature}`)
                outgoingResponse.write(`<td class="actual">${announcement.TimeAtLocation.substring(11, 16)}`)
                outgoingResponse.write(`<td>${announcement.AdvertisedTimeAtLocation.substring(11, 16)}`)
                outgoingResponse.write('</table>')
            }

            outgoingResponse.end()
        }
    }

    function handleError(e) {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    }
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
            outgoingResponse.write(`<style>${css()}</style>`)

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Tullinge</caption>')
            sub.filter(northbound)
                .forEach(ankomst => selectAvgangAndWriteRow(tul.filter(northbound)
                    .filter(avgang => minutes(ankomst, avgang) > 29), ankomst))
            outgoingResponse.write('</table>')

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Sundbyberg</caption>')
            sub.filter(southbound)
                .forEach(avgang => selectAnkomstAndWriteRow(tul.filter(southbound)
                    .filter(ankomst => minutes(ankomst, avgang) > 29), avgang))
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

            function selectAnkomstAndWriteRow(ankomsts, avgang) {
                if (ankomsts.length)
                    writeRow(ankomsts
                        .reduce((prev, cur) => {
                            const diff1 = minutes(prev, avgang)
                            const diff2 = minutes(cur, avgang)
                            return diff2 < diff1 ? cur : prev
                        }), avgang)
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
                outgoingResponse.write(`<td><a href=${trainIdent}>${trainIdent}</a>`)
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

function css() {
    return `
    body {
        font-family: sans-serif
    }

    table {
        margin-bottom: 1em
    }

    caption {
        font-weight: bold
    }

    .actual {
        font-weight: bold
    }
    `
}

module.exports = requestListener
