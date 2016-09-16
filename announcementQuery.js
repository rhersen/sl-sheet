const key = require('./key')

function announcementQuery(t, locations, direction) {
    return `<REQUEST>
     <LOGIN authenticationkey='${key}' />
     <QUERY objecttype='TrainAnnouncement' orderBy='AdvertisedTimeAtLocation'>
      <FILTER>
       <AND>
        <IN name='ProductInformation' value='Pendeltåg' />
        <NE name='Canceled' value='true' />
        <OR> ${locations.map(location => `<EQ name='LocationSignature' value='${location}' />`).join(' ')} </OR>
        <LIKE name='AdvertisedTrainIdent' value='/[${direction === 'n' ? '02468' : '13579'}]$/' />
        <OR>
         <AND>
          <GT name='AdvertisedTimeAtLocation' value='$dateadd(-${t})' />
          <LT name='AdvertisedTimeAtLocation' value='$dateadd(${t})' />
         </AND>
         <AND>
          <GT name='EstimatedTimeAtLocation' value='$dateadd(-${t})' />
          <LT name='EstimatedTimeAtLocation' value='$dateadd(${t})' />
         </AND>
         <AND>
          <GT name='TimeAtLocation' value='$dateadd(-${t})' />
          <LT name='TimeAtLocation' value='$dateadd(${t})' />
         </AND>
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

module.exports = announcementQuery
