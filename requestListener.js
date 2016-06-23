const http = require('http')
const atob = require('atob')
const moment = require('moment')

function requestListener(incomingRequest, outgoingResponse) {
    let match

    if (/favicon.ico/.test(decodeURIComponent(incomingRequest.url)))
        favicon(outgoingResponse)
    else if (match = /api\/departures\/(.+)/.exec(decodeURIComponent(incomingRequest.url)))
        departures(match[1], outgoingResponse)
    else if (/ingela/.test(decodeURIComponent(incomingRequest.url)))
        ingela(outgoingResponse)
}

function departures(location, outgoingResponse) {
    outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})

    const postData = departuresQuery(location)
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

    outgoingRequest.on('error', (e) => {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    })

    outgoingRequest.write(postData)
    outgoingRequest.end()

    function handleResponse(incomingResponse) {
        let body = ''
        incomingResponse.setEncoding('utf8')
        incomingResponse.on('data', chunk => body += chunk)
        incomingResponse.on('end', done)

        function done() {
            const parsed = JSON.parse(body)
            const announcements = parsed.RESPONSE.RESULT[0].TrainAnnouncement
            const a = announcements.map(announcement => ` 
                 <td>${announcement.ActivityType}
                 <td>${announcement.LocationSignature}
                 <td>${announcement.ToLocation[0].LocationName}
                 <td>${announcement.AdvertisedTimeAtLocation}
                 `)
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            outgoingResponse.end(`<table>${a.join('<tr>')}`)
        }
    }
}

function ingela(outgoingResponse) {
    outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    const postData = ingelaQuery()
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

    outgoingRequest.on('error', (e) => {
        outgoingResponse.writeHead(500, {'Content-Type': 'text/plain'})
        outgoingResponse.end(`problem with request: ${e.message}`)
    })

    outgoingRequest.write(postData)
    outgoingRequest.end()
    function ingelaQuery() {
        return `<REQUEST>
     <LOGIN authenticationkey='cfdeb57c80374fcd80ca811d2bcb561a' />
     <QUERY objecttype='TrainAnnouncement' orderBy='AdvertisedTimeAtLocation'>
      <FILTER>
       <AND>
        <IN name='ProductInformation' value='Pendeltåg' />
        <NE name='Canceled' value='true' />
        <LIKE name='AdvertisedTrainIdent' value='/[02468]$/' />
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
            const parsed = JSON.parse(body)
            const announcements = parsed.RESPONSE.RESULT[0].TrainAnnouncement
            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            const sub = announcements.filter(announcement => announcement.LocationSignature === 'Sub')
            const tul = announcements.filter(announcement => announcement.LocationSignature === 'Tul')

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
                const minuteDiff = minutes(ankomst, avgang)
                outgoingResponse.write(`${departureTime} ${trainIdent} ${minuteDiff} min<br>`)
            }

            sub.forEach(ankomst => {
                const avgangs = tul.filter(avgang => minutes(ankomst, avgang) > 29)
                if (avgangs.length)
                    writeRow(ankomst, avgangs
                        .reduce((prev, cur) => {
                            const diff1 = minutes(ankomst, prev)
                            const diff2 = minutes(ankomst, cur)
                            return diff2 < diff1 ? cur : prev
                        })
                    )
            })

            outgoingResponse.end()
        }
    }
}

function favicon(outgoingResponse) {
    outgoingResponse.writeHead(200, {'Content-Type': 'image/x-icon'})
    outgoingResponse.end(atob('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T'))
}

function departuresQuery(locationSignature) {
    return `<REQUEST>
     <LOGIN authenticationkey='cfdeb57c80374fcd80ca811d2bcb561a' />
     <QUERY objecttype='TrainAnnouncement'>
      <FILTER>
       <AND>
        <IN name='ProductInformation' value='Pendeltåg' />
        <NE name='Canceled' value='true' />
        <EQ name='ActivityType' value='Avgang' />
        <EQ name='LocationSignature' value='${locationSignature}' />
        <OR>
         <AND>
          <GT name='AdvertisedTimeAtLocation' value='$dateadd(-00:15:00)' />
          <LT name='AdvertisedTimeAtLocation' value='$dateadd(00:59:00)' />
         </AND>
         <GT name='EstimatedTimeAtLocation' value='$dateadd(-00:15:00)' />
        </OR>
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


module.exports = requestListener
