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
        expect(times(
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
        )).to.deep.equal({
            Tul2768Ankomst: '2016-09-05T21:22:00',
            Tul2768Avgang: '2016-09-05T21:22:00',
            Flb2768Ankomst: '2016-09-05T21:25:00',
            Flb2768Avgang: '2016-09-05T21:25:00'
        })
    })
})
