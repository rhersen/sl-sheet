module.exports = function (s) {
    if (!s)
        return ''

    const a = f(s.AdvertisedTimeAtLocation)
    const e = f(s.EstimatedTimeAtLocation)
    const t = f(s.TimeAtLocation)

    if (!e && !t)
        return a

    if (a === t)
        return wrap(t, 'b')

    if (t)
        return `${a}/${wrap(t, 'b')}`

    return `${a}/${wrap(e, 'i')}`
}

function wrap(s, tag) {
    if (s)
        return `<${tag}>${s}</${tag}>`

    return ''
}

function f(s) {
    let match

    if (match = /T0(\d:\d\d):00/.exec(s))
        return match[1]

    if (match = /T0(\d:\d\d:\d\d)/.exec(s))
        return match[1]

    if (match = /T(\d\d:\d\d):00/.exec(s))
        return match[1]

    if (match = /T(\d\d:\d\d:\d\d)/.exec(s))
        return match[1]

    return ''
}
