const expect = require('chai').expect

const times = require('../times')
const trains = require('../trains')

describe('trains', function () {
    it('returns list of AdvertisedTrainIdent', function () {
        expect(trains(
            [{
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-05T21:22:00',
                'AdvertisedTrainIdent': '2768',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-05T21:22:00',
                'AdvertisedTrainIdent': '2768',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-05T21:25:00',
                'AdvertisedTrainIdent': '2768',
                'LocationSignature': 'Flb',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-05T21:25:00',
                'AdvertisedTrainIdent': '2768',
                'LocationSignature': 'Flb',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }]
        )).to.deep.equal(['2768'])
    })
})

describe('times', function () {
    it('returns object with composite keys', function () {
        const actual = times(
            [{
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-08T22:18:00',
                'AdvertisedTrainIdent': '2772',
                'LocationSignature': 'Tu',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-09-08T22:17:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-08T22:18:00',
                'AdvertisedTrainIdent': '2772',
                'LocationSignature': 'Tu',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-09-08T22:18:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-08T22:22:00',
                'AdvertisedTrainIdent': '2772',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-08T22:22:00',
                'AdvertisedTrainIdent': '2772',
                'LocationSignature': 'Tul',
                'ToLocation': [{'LocationName': 'Mr', 'Priority': 1, 'Order': 0}]
            }]
        )

        expect(actual.Tu2772Ankomst.AdvertisedTimeAtLocation).to.equal('2016-09-08T22:18:00')
        expect(actual.Tu2772Avgang.AdvertisedTimeAtLocation).to.equal('2016-09-08T22:18:00')
        expect(actual.Tul2772Ankomst.AdvertisedTimeAtLocation).to.equal('2016-09-08T22:22:00')
        expect(actual.Tul2772Avgang.AdvertisedTimeAtLocation).to.equal('2016-09-08T22:22:00')
    })
})
