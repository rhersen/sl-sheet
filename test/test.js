const expect = require('chai').expect

const formatTimes = require('../formatTimes')
const times = require('../times')
const trains = require('../trains')

describe('formatTimes', function () {
    it('returns empty string given no input', function () {
        expect(formatTimes()).to.equal('')
    })

    it('trims date', function () {
        expect(formatTimes({'AdvertisedTimeAtLocation': '2016-09-05T21:22:23'})).to.equal('21:22:23')
    })

    it('trims leading zero from hour', function () {
        expect(formatTimes({'AdvertisedTimeAtLocation': '2016-09-05T09:23:00'})).to.equal('9:23')
    })

    it('shows estimated if no actual exists', function () {
        expect(formatTimes({
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00',
            'EstimatedTimeAtLocation': '2016-09-05T21:24:00'
        })).to.equal('21:23/<i>21:24</i>')
    })

    it('does not show estimated if actual exists', function () {
        expect(formatTimes({
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00',
            'EstimatedTimeAtLocation': '2016-09-05T21:24:00',
            'TimeAtLocation': '2016-09-05T21:25:00'
        })).to.equal('21:23/<b>21:25</b>')
    })

    it('does not show advertised if actual is same', function () {
        expect(formatTimes({
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00',
            'TimeAtLocation': '2016-09-05T21:23:00'
        })).to.equal('<b>21:23</b>')
    })
})

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

    it('sorts on AdvertisedTimeAtLocation', function () {
        expect(trains(
            [{
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-21T06:04:00',
                'AdvertisedTrainIdent': '2507',
                'LocationSignature': 'Spå',
                'ToLocation': [{'LocationName': 'Vhe', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-21T06:04:00',
                'AdvertisedTrainIdent': '2507',
                'LocationSignature': 'Spå',
                'ToLocation': [{'LocationName': 'Vhe', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-21T05:54:00',
                'AdvertisedTrainIdent': '2305',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Nyh', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-09-21T05:53:00'
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-21T05:54:00',
                'AdvertisedTrainIdent': '2305',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Nyh', 'Priority': 1, 'Order': 0}],
                'TimeAtLocation': '2016-09-21T05:54:00'
            }, {
                'ActivityType': 'Ankomst',
                'AdvertisedTimeAtLocation': '2016-09-21T06:09:00',
                'AdvertisedTrainIdent': '2507',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Vhe', 'Priority': 1, 'Order': 0}]
            }, {
                'ActivityType': 'Avgang',
                'AdvertisedTimeAtLocation': '2016-09-21T06:09:00',
                'AdvertisedTrainIdent': '2507',
                'LocationSignature': 'Sub',
                'ToLocation': [{'LocationName': 'Vhe', 'Priority': 1, 'Order': 0}]
            }])).to.deep.equal(['2305', '2507'])
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
