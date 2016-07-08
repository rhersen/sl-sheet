const http = require('http')
const moment = require('moment')

const announcementQuery = require('./announcementQuery')
const MatchingTrains = require('./MatchingTrains')
const css = require('./css')

function ingela(outgoingResponse) {
    const postData = announcementQuery(`
        <OR>
          <EQ name='LocationSignature' value='Tul' />
          <EQ name='LocationSignature' value='Sub' />
        </OR>
        <GT name='AdvertisedTimeAtLocation' value='$dateadd(-1:00:00)' />
        <LT name='AdvertisedTimeAtLocation' value='$dateadd(2:00:00)' />`
    )

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
            const as = JSON.parse(body).RESPONSE.RESULT[0].TrainAnnouncement
            const sub = as.filter(a => a.LocationSignature === 'Sub').filter(a => a.ActivityType === 'Ankomst')
            const tul = as.filter(a => a.LocationSignature === 'Tul').filter(a => a.ActivityType === 'Avgang')
            const southbounds = sub.filter(southbound)
                .map(avgang =>
                    selectAnkomst(tul.filter(southbound).filter(ankomst => minutes(ankomst, avgang) > 29), avgang))

            outgoingResponse.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'})
            outgoingResponse.write('<!DOCTYPE html>')
            outgoingResponse.write('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
            outgoingResponse.write('<title>Ingela</title>')
            outgoingResponse.write(`<style>${css()}</style>`)

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Tullinge</caption>')

            MatchingTrains.getNorthbound(as)
                .forEach(selected => selected && writeRow(selected.ankomst, selected.avgang))

            outgoingResponse.write('</table>')

            outgoingResponse.write('<table>')
            outgoingResponse.write('<caption>Från Sundbyberg</caption>')
            southbounds.forEach(selected => selected && writeRow(selected.ankomst, selected.avgang))
            outgoingResponse.write('</table>')

            outgoingResponse.end()

            function southbound(ankomst) {
                return /[13579]$/.test(ankomst.AdvertisedTrainIdent)
            }

            function selectAnkomst(ankomsts, avgang) {
                if (ankomsts.length) {
                    const selected = ankomsts.reduce((prev, cur) => {
                        const diff1 = minutes(prev, avgang)
                        const diff2 = minutes(cur, avgang)
                        return diff2 < diff1 ? cur : prev
                    })

                    return {ankomst: selected, avgang: avgang}
                }
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

module.exports = ingela
