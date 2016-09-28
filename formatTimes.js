module.exports = function (s) {
    if (!s)
        return ''

    const a = f(s.AdvertisedTimeAtLocation)
    const e = f(s.EstimatedTimeAtLocation)
    const t = f(s.TimeAtLocation)

    if (a === t)
        return wrap(t, 'b')

    if (t) {
        if (s.ActivityType === 'Ankomst')
            return wrap(t, 'b')

        return `${wrap(t, 'b')}/${removeHours(a)}`
    }

    if (e)
        return `${wrap(e, 'i')}/${removeHours(a)}`

    return a

    function removeHours(time) {
        return time.substr(time.indexOf(':') + 1)
    }
}

function wrap(s, tag) {
    if (s)
        return `<${tag}>${s}</${tag}>`

    return ''
}

function f(s) {
    let match
    const regExp = [/T0(\d:\d\d):00/, /T0(\d:\d\d:\d\d)/, /T(\d\d:\d\d):00/, /T(\d\d:\d\d:\d\d)/]

    for (let i = 0; i < regExp.length; i++)
        if (match = regExp[i].exec(s))
            return match[1]

    return ''
}
