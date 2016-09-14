function css() {
    return `body {
    font-family: sans-serif
}

table {
    border-collapse: collapse;
}

td.Ankomst {
    border-left: thin solid;
    border-right: thin solid;
    border-top: thin solid;
    border-bottom: none;
}

td.Avgang {
    border-left: thin solid;
    border-right: thin solid;
    border-top: none;
    border-bottom: thin solid;
}

caption {
    font-weight: bold
}

.actual {
    font-weight: bold
}`
}

module.exports = css
