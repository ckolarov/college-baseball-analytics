/**
 * NiFi ExecuteScript processor: Parse hitting stats HTML
 *
 * Input:  FlowFile with raw HTML content from InvokeHTTP
 * Output: FlowFile with JSON array of hitter stat objects
 *
 * Ports logic from src/agents/data-collection/scrapers/ncaa-stats.ts
 * and src/agents/data-collection/parsers/hitter-stats.ts
 */
import org.jsoup.Jsoup
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

def flowFile = session.get()
if (!flowFile) return

def html = ''
session.read(flowFile, { inputStream ->
    html = inputStream.getText('UTF-8')
} as InputStreamCallback)

def doc = Jsoup.parse(html)

// Find hitting table (contains "avg" or "ba" but not "era")
def hittingTable = doc.select('table').find { table ->
    def headerText = table.select('th').text().toLowerCase()
    (headerText.contains('avg') || headerText.contains('ba')) && !headerText.contains('era')
}

def players = []

if (hittingTable) {
    def headers = []
    hittingTable.select('thead th, thead td').each { th ->
        headers << th.text().trim().toLowerCase()
    }

    hittingTable.select('tbody tr').each { row ->
        def cells = row.select('td')
        if (cells.size() < 3) return

        def nameIdx = findHeaderIndex(headers, ['player', 'name', '#'])
        def nameText = cells.size() > nameIdx ? cells[nameIdx].text().trim() : ''
        def nameParts = parseName(nameText)
        if (!nameParts) return

        def ab = parseIntSafe(getCellByHeader(cells, headers, ['ab']))
        def h = parseIntSafe(getCellByHeader(cells, headers, ['h']))
        def doubles = parseIntSafe(getCellByHeader(cells, headers, ['2b']))
        def triples = parseIntSafe(getCellByHeader(cells, headers, ['3b']))
        def hr = parseIntSafe(getCellByHeader(cells, headers, ['hr']))
        def bb = parseIntSafe(getCellByHeader(cells, headers, ['bb']))
        def so = parseIntSafe(getCellByHeader(cells, headers, ['so', 'k']))

        // Parse or calculate batting avg
        def battingAvg = parseFloatSafe(getCellByHeader(cells, headers, ['avg', 'ba']))
        if (battingAvg == null && ab && ab > 0 && h != null) {
            battingAvg = h / (double) ab
        }

        // Parse or calculate SLG
        def slg = parseFloatSafe(getCellByHeader(cells, headers, ['slg', 'slg%']))
        if (slg == null && ab && ab > 0) {
            def singles = (h ?: 0) - (doubles ?: 0) - (triples ?: 0) - (hr ?: 0)
            def totalBases = singles + (doubles ?: 0) * 2 + (triples ?: 0) * 3 + (hr ?: 0) * 4
            slg = totalBases / (double) ab
        }

        // Parse or calculate OBP
        def obp = parseFloatSafe(getCellByHeader(cells, headers, ['obp', 'ob%']))
        if (obp == null && ab && ab > 0 && h != null) {
            def pa = ab + (bb ?: 0)
            if (pa > 0) obp = ((h ?: 0) + (bb ?: 0)) / (double) pa
        }

        // OPS
        def ops = parseFloatSafe(getCellByHeader(cells, headers, ['ops']))
        if (ops == null && obp != null && slg != null) ops = obp + slg

        // ISO = SLG - BA
        def isoSlg = (slg != null && battingAvg != null) ? slg - battingAvg : null

        // K rate and BB rate
        def pa = ab ? ab + (bb ?: 0) : null
        def kRateHitting = (pa && pa > 0 && so != null) ? so / (double) pa : null
        def bbRateHitting = (pa && pa > 0 && bb != null) ? bb / (double) pa : null

        // BABIP = (H - HR) / (AB - K - HR)
        def babip = null
        if (h != null && hr != null && ab != null && so != null) {
            def denom = ab - so - hr
            if (denom > 0) babip = (h - hr) / (double) denom
        }

        players << [
            firstName   : nameParts.firstName,
            lastName    : nameParts.lastName,
            position    : getCellByHeader(cells, headers, ['pos']) ?: 'UT',
            classYear   : getCellByHeader(cells, headers, ['yr', 'cl', 'class']),
            gamesPlayed : parseIntSafe(getCellByHeader(cells, headers, ['gp', 'g'])),
            gamesStarted: parseIntSafe(getCellByHeader(cells, headers, ['gs'])),
            atBats      : ab,
            hits        : h,
            doubles     : doubles,
            triples     : triples,
            homeRuns    : hr,
            rbi         : parseIntSafe(getCellByHeader(cells, headers, ['rbi'])),
            runs        : parseIntSafe(getCellByHeader(cells, headers, ['r'])),
            stolenBases : parseIntSafe(getCellByHeader(cells, headers, ['sb'])),
            walks       : bb,
            battingAvg  : round3(battingAvg),
            obp         : round3(obp),
            slg         : round3(slg),
            ops         : round3(ops),
            isoSlg      : round3(isoSlg),
            kRateHitting: round3(kRateHitting),
            bbRateHitting: round3(bbRateHitting),
            babip       : round3(babip)
        ]
    }
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(players).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', players.size().toString())
flowFile = session.putAttribute(flowFile, 'scrape.type', 'hitting')
session.transfer(flowFile, REL_SUCCESS)

// --- Helper functions ---

def findHeaderIndex(List headers, List names) {
    for (name in names) {
        def idx = headers.findIndexOf { it == name || it.contains(name) }
        if (idx != -1) return idx
    }
    return 0
}

def getCellByHeader(cells, List headers, List names) {
    def idx = findHeaderIndex(headers, names)
    (idx >= 0 && idx < cells.size()) ? cells[idx].text().trim() : ''
}

def parseName(String name) {
    if (!name || name.length() < 2) return null
    def cleaned = name.replaceAll(/^\d+\s*/, '').trim()
    if (!cleaned) return null
    if (cleaned.contains(',')) {
        def parts = cleaned.split(',').collect { it.trim() }
        return [firstName: parts.size() > 1 ? parts[1] : '', lastName: parts[0]]
    }
    def parts = cleaned.split(/\s+/)
    if (parts.length < 2) return null
    return [firstName: parts[0], lastName: parts.drop(1).join(' ')]
}

def parseFloatSafe(String s) {
    try { return s ? Double.parseDouble(s) : null } catch (e) { return null }
}

def parseIntSafe(String s) {
    try { return s ? Integer.parseInt(s.replaceAll(/[^\d-]/, '')) : null } catch (e) { return null }
}

def round3(Double val) {
    val != null ? Math.round(val * 1000) / 1000.0 : null
}
