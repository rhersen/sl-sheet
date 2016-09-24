const expect = require('chai').expect

const formatTimes = require('../formatTimes')

describe('formatTimes', function () {
    it('returns empty string given no input', function () {
        expect(formatTimes()).to.equal('')
    })

    it('trims date', function () {
        expect(formatTimes({'AdvertisedTimeAtLocation': '2016-09-05T21:22:23'})).to.equal('21:22:23')
    })

    it('trims leading zero from hour', function () {
        expect(formatTimes({'AdvertisedTimeAtLocation': '2016-09-05T09:23:00'})).to.equal('9:23')
        expect(formatTimes({'AdvertisedTimeAtLocation': '2016-09-05T09:23:21'})).to.equal('9:23:21')
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
            'TimeAtLocation': '2016-09-05T21:25:00'
        })).to.equal('21:23/<b>21:25</b>')
    })

    it('does not show advertised if actual is same', function () {
        expect(formatTimes({
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00',
            'TimeAtLocation': '2016-09-05T21:23:00'
        })).to.equal('<b>21:23</b>')
    })

    it('does not show advertised if activity type is ankomst', function () {
        expect(formatTimes({
            'ActivityType': 'Ankomst',
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00',
            'TimeAtLocation': '2016-09-05T21:22:00'
        })).to.equal('<b>21:22</b>')
    })

    it('shows advertised if activity type is ankomst', function () {
        expect(formatTimes({
            'ActivityType': 'Ankomst',
            'EstimatedTimeAtLocation': '2016-09-05T21:24:00',
            'AdvertisedTimeAtLocation': '2016-09-05T21:23:00'
        })).to.equal('21:23/<i>21:24</i>')
    })
})
