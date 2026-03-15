/**
 * NiFi ExecuteScript processor: Parse pitching stats HTML
 *
 * Input:  FlowFile with raw HTML content from InvokeHTTP
 * Output: FlowFile with JSON array of pitcher stat objects
 *
 * Ports logic from src/agents/data-collection/scrapers/ncaa-stats.ts
 * and src/agents/data-collection/parsers/pitcher-stats.ts
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

// Find pitching stats table (contains "era" or "ip" in headers)
def pitchingTable = doc.select('table').find { table ->
    def headerText = table.select('th').text().toLowerCase()
    headerText.contains('era') || headerText.contains('ip')
}

def players = []

if (pitchingTable) {
    // Build header index
    def headers = []
    pitchingTable.select('thead th, thead td').each { th ->
        headers << th.text().trim().toLowerCase()
    }

    pitchingTable.select('tbody tr').each { row ->
        def cells = row.select('td')
        if (cells.size() < 3) return

        // Parse name
        def nameIdx = findHeaderIndex(headers, ['player', 'name', '#'])
        def nameText = cells.size() > nameIdx ? cells[nameIdx].text().trim() : ''
        def nameParts = parseName(nameText)
        if (!nameParts) return

        // Extract raw stats
        def era = getCellByHeader(cells, headers, ['era'])
        def ipRaw = getCellByHeader(cells, headers, ['ip'])
        def k = getCellByHeader(cells, headers, ['so', 'k'])
        def bb = getCellByHeader(cells, headers, ['bb'])
        def h = getCellByHeader(cells, headers, ['h'])
        def er = getCellByHeader(cells, headers, ['er'])

        // Convert IP from baseball format (6.1 = 6⅓)
        def ip = convertInningsPitched(parseFloatSafe(ipRaw))

        // Calculate derived stats
        def kInt = parseIntSafe(k)
        def bbInt = parseIntSafe(bb)
        def hInt = parseIntSafe(h)

        def whip = (ip && ip > 0 && hInt != null && bbInt != null) ?
            round3((hInt + bbInt) / ip) : null

        def kPerNine = (ip && ip > 0 && kInt != null) ?
            Math.round((kInt / ip) * 9 * 100) / 100.0 : null

        def bbPerNine = (ip && ip > 0 && bbInt != null) ?
            Math.round((bbInt / ip) * 9 * 100) / 100.0 : null

        // Estimate batters faced: BF ≈ 3*IP + H + BB
        def bf = ip != null ? Math.round(3 * ip + (hInt ?: 0) + (bbInt ?: 0)) : null

        def kPercent = (bf && kInt != null) ? round3(kInt / bf) : null
        def bbPercent = (bf && bbInt != null) ? round3(bbInt / bf) : null

        // Opponent BA: H / (BF - BB)
        def oppBattingAvg = (bf && hInt != null && bbInt != null && (bf - bbInt) > 0) ?
            round3(hInt / (bf - bbInt)) : null

        players << [
            firstName    : nameParts.firstName,
            lastName     : nameParts.lastName,
            position     : 'P',
            classYear    : getCellByHeader(cells, headers, ['yr', 'cl', 'class']),
            era          : parseFloatSafe(era),
            wins         : parseIntSafe(getCellByHeader(cells, headers, ['w'])),
            losses       : parseIntSafe(getCellByHeader(cells, headers, ['l'])),
            inningsPitched: ip,
            strikeouts   : kInt,
            walks        : bbInt,
            hitsAllowed  : hInt,
            earnedRuns   : parseIntSafe(er),
            gamesPlayed  : parseIntSafe(getCellByHeader(cells, headers, ['app', 'gp', 'g'])),
            gamesStarted : parseIntSafe(getCellByHeader(cells, headers, ['gs'])),
            whip         : whip,
            kPerNine     : kPerNine,
            bbPerNine    : bbPerNine,
            kPercent     : kPercent,
            bbPercent    : bbPercent,
            oppBattingAvg: oppBattingAvg
        ]
    }
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(players).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', players.size().toString())
flowFile = session.putAttribute(flowFile, 'scrape.type', 'pitching')
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

def convertInningsPitched(Double raw) {
    if (raw == null) return null
    def whole = Math.floor(raw) as int
    def decimal = Math.round((raw - whole) * 10) as int
    return whole + decimal / 3.0
}

def parseFloatSafe(String s) {
    try { return s ? Double.parseDouble(s) : null } catch (e) { return null }
}

def parseIntSafe(String s) {
    try { return s ? Integer.parseInt(s.replaceAll(/[^\d-]/, '')) : null } catch (e) { return null }
}

def round3(double val) {
    Math.round(val * 1000) / 1000.0
}
