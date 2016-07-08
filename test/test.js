const expect = require('chai').expect

const formatLatestAnnouncement = require('../formatLatestAnnouncement')
const MatchingTrains = require('../MatchingTrains')

describe('formatLatestAnnouncement', function () {
    it('no activities', function () {
        expect(formatLatestAnnouncement()).to.equal('Aktuell information saknas')
        expect(formatLatestAnnouncement([])).to.equal('Aktuell information saknas')
    })

    it('departure on time', function () {
        expect(formatLatestAnnouncement([{
            'ActivityType': 'Avgang',
            'AdvertisedTimeAtLocation': '2016-06-28T22:06:00',
            'AdvertisedTrainIdent': '2868',
            'LocationSignature': 'Sub',
            'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}],
            'TimeAtLocation': '2016-06-28T22:06:00'
        }])).to.equal('Tåg 2868 mot Spå avgick från Sub i tid klockan 22:06')
    })

    it('departure one minute late', function () {
        expect(formatLatestAnnouncement([{
            'ActivityType': 'Ankomst',
            'AdvertisedTimeAtLocation': '2016-06-28T22:19:00',
            'AdvertisedTrainIdent': '2870',
            'LocationSignature': 'Åbe',
            'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}],
            'TimeAtLocation': '2016-06-28T22:20:00'
        }])).to.equal('Tåg 2870 mot Spå ankom till Åbe nästan i tid klockan 22:20')
    })

    it('arrival three minutes late', function () {
        expect(formatLatestAnnouncement([{
            'ActivityType': 'Ankomst',
            'AdvertisedTimeAtLocation': '2016-06-28T21:52:00',
            'AdvertisedTrainIdent': '2769',
            'LocationSignature': 'Åbe',
            'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}],
            'TimeAtLocation': '2016-06-28T21:55:00'
        }])).to.equal('Tåg 2769 mot Söc ankom till Åbe 3 minuter försenat klockan 21:55')
    })

    it('early arrival', function () {
        expect(formatLatestAnnouncement([{
            'ActivityType': 'Ankomst',
            'AdvertisedTimeAtLocation': '2016-06-28T22:10:00',
            'AdvertisedTrainIdent': '2868',
            'LocationSignature': 'Spå',
            'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}],
            'TimeAtLocation': '2016-06-28T22:09:00'
        }])).to.equal('Tåg 2868 mot Spå ankom till Spå i god tid klockan 22:09')
    })
})

describe('MatchingTrains', function () {
    it('getNorthbound', function () {
        expect(MatchingTrains.getNorthbound([
            {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:06:00',
                'AdvertisedTrainIdent': '2812',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:05:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:06:00',
                'AdvertisedTrainIdent': '2812',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:06:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:21:00',
                'AdvertisedTrainIdent': '2514',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T07:54:00',
                'AdvertisedTrainIdent': '2813',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T07:53:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:21:00',
                'AdvertisedTrainIdent': '2514',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T07:54:00',
                'AdvertisedTrainIdent': '2813',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T07:54:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:36:00',
                'AdvertisedTrainIdent': '2814',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:36:00',
                'AdvertisedTrainIdent': '2814',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:09:00',
                'AdvertisedTrainIdent': '2515',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:08:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:09:00',
                'AdvertisedTrainIdent': '2515',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:09:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:24:00',
                'AdvertisedTrainIdent': '2815',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:24:00',
                'AdvertisedTrainIdent': '2815',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Skg', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T07:53:00',
                'AdvertisedTrainIdent': '2611',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T07:54:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T07:53:00',
                'AdvertisedTrainIdent': '2611',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T07:53:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:15:00',
                'AdvertisedTrainIdent': '2213',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Tu', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:15:00',
                'AdvertisedTrainIdent': '2213',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Tu', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:14:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:08:00',
                'AdvertisedTrainIdent': '2713',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:08:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:08:00',
                'AdvertisedTrainIdent': '2713',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:08:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:23:00',
                'AdvertisedTrainIdent': '2613',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:23:00',
                'AdvertisedTrainIdent': '2613',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Söc', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T07:52:00',
                'AdvertisedTrainIdent': '2714',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'EstimatedTimeAtLocation': '2016-07-08T07:53:00',
                'TimeAtLocation': '2016-07-08T07:54:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T07:52:00',
                'AdvertisedTrainIdent': '2714',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'EstimatedTimeAtLocation': '2016-07-08T07:52:00',
                'TimeAtLocation': '2016-07-08T07:53:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:07:00',
                'AdvertisedTrainIdent': '2614',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:07:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:07:00',
                'AdvertisedTrainIdent': '2614',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:05:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:22:00',
                'AdvertisedTrainIdent': '2716',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:22:00',
                'AdvertisedTrainIdent': '2716',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:15:00',
                'AdvertisedTrainIdent': '2216',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'U', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-07-08T08:14:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:15:00',
                'AdvertisedTrainIdent': '2216',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'U', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-07-08T08:37:00',
                'AdvertisedTrainIdent': '2616',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-07-08T08:37:00',
                'AdvertisedTrainIdent': '2616',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }]
        ).filter(x => x))
            .to.deep.equal([{
                'ankomst': {
                    'ActivityType': 'Ankomst',
                    'AdvertisedTimeAtLocation': '2016-07-08T08:36:00',
                    'AdvertisedTrainIdent': '2814',
                    'LocationSignature': 'Sub',
                    'ToLocation': [{'LocationName': 'Spå', 'Priority': 1, 'Order': 0}]
                },
                'avgang': {
                    'ActivityType': 'Avgang',
                    'AdvertisedTimeAtLocation': '2016-07-08T07:52:00',
                    'AdvertisedTrainIdent': '2714',
                    'LocationSignature': 'Tul',
                    'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                    'EstimatedTimeAtLocation': '2016-07-08T07:53:00',
                    'TimeAtLocation': '2016-07-08T07:54:00'
                }
            }]
        )
    })

})
