/**
 * NiFi ExecuteScript processor: Parse schedule HTML
 *
 * Input:  FlowFile with raw HTML content from InvokeHTTP
 * Output: FlowFile with JSON array of schedule entries
 */
import org.jsoup.Jsoup
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

def flowFile = session.get()
if (!flowFile) return

def html = ''
session.read(flowFile, { inputStream ->
    html = inputStream.getText('UTF-8')
} as InputStreamCallback)

def doc = Jsoup.parse(html)
def entries = []

// Common schedule table patterns
def scheduleTable = doc.select('table').find { table ->
    def headerText = table.select('th').text().toLowerCase()
    headerText.contains('date') || headerText.contains('opponent')
}

if (scheduleTable) {
    def headers = []
    scheduleTable.select('thead th, thead td').each { th ->
        headers << th.text().trim().toLowerCase()
    }

    scheduleTable.select('tbody tr').each { row ->
        def cells = row.select('td')
        if (cells.size() < 2) return

        def dateIdx = findHeaderIndex(headers, ['date'])
        def oppIdx = findHeaderIndex(headers, ['opponent', 'opp'])
        def locIdx = findHeaderIndex(headers, ['location', 'loc', 'site'])
        def resultIdx = findHeaderIndex(headers, ['result', 'score', 'w/l'])

        def dateStr = cells.size() > dateIdx ? cells[dateIdx].text().trim() : ''
        def opponent = cells.size() > oppIdx ? cells[oppIdx].text().trim() : ''
        def location = cells.size() > locIdx ? cells[locIdx].text().trim() : ''
        def result = cells.size() > resultIdx ? cells[resultIdx].text().trim() : ''

        if (!opponent) return

        // Determine home/away
        def isHome = true
        if (opponent.startsWith('at ') || opponent.startsWith('@ ')) {
            isHome = false
            opponent = opponent.replaceFirst(/^(at |@ )/, '').trim()
        } else if (opponent.startsWith('vs ') || opponent.startsWith('vs. ')) {
            opponent = opponent.replaceFirst(/^(vs\.? )/, '').trim()
        }

        // Strip ranking from opponent name (e.g., "#5 Campbell" -> "Campbell")
        opponent = opponent.replaceAll(/^#\d+\s+/, '').trim()

        def parsedDate = parseScheduleDate(dateStr)

        entries << [
            date        : parsedDate ?: dateStr,
            opponentName: opponent,
            isHome      : isHome,
            location    : location,
            result      : result ?: null
        ]
    }
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(entries).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', entries.size().toString())
flowFile = session.putAttribute(flowFile, 'scrape.type', 'schedule')
session.transfer(flowFile, REL_SUCCESS)

// --- Helpers ---

def findHeaderIndex(List headers, List names) {
    for (name in names) {
        def idx = headers.findIndexOf { it == name || it.contains(name) }
        if (idx != -1) return idx
    }
    return 0
}

def parseScheduleDate(String dateStr) {
    if (!dateStr) return null
    def formats = [
        'MM/dd/yyyy', 'M/d/yyyy', 'MM/dd/yy', 'M/d/yy',
        'MMM d, yyyy', 'MMMM d, yyyy', 'yyyy-MM-dd'
    ]
    for (fmt in formats) {
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(fmt)).toString()
        } catch (DateTimeParseException ignored) {}
    }
    return null
}
