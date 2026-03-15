/**
 * NiFi ExecuteScript processor: Parse Warren Nolan RPI HTML
 * Process Group: rpi
 *
 * Input:  FlowFile with HTML from https://www.warrennolan.com/baseball/rpi/nitty
 * Output: FlowFile with JSON array of RPI entries
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
def entries = []

// Warren Nolan uses a table with ranks
def rows = doc.select('table tbody tr')
rows.each { row ->
    def cells = row.select('td')
    if (cells.size() < 3) return

    try {
        def rank = cells[0].text().trim().replaceAll(/[^\d]/, '')
        def teamName = cleanTeamName(cells[1].text().trim())
        def rating = cells[2].text().trim()
        def record = cells.size() > 3 ? cells[3].text().trim() : ''
        def confRecord = cells.size() > 4 ? cells[4].text().trim() : ''

        if (!rank || !teamName) return

        entries << [
            rank            : Integer.parseInt(rank),
            teamName        : teamName,
            rating          : Double.parseDouble(rating),
            record          : record,
            conferenceRecord: confRecord
        ]
    } catch (Exception e) {
        // Skip malformed rows
    }
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(entries).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', entries.size().toString())
session.transfer(flowFile, REL_SUCCESS)

def cleanTeamName(String name) {
    // Remove leading rank numbers and trailing records like "(20-5)"
    name.replaceAll(/^\d+\.?\s*/, '')
        .replaceAll(/\s*\(\d+-\d+.*\)\s*$/, '')
        .trim()
}
