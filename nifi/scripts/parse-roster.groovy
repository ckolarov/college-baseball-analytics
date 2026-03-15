/**
 * NiFi ExecuteScript processor: Parse NCAA roster HTML
 *
 * Input:  FlowFile with raw HTML content from InvokeHTTP
 * Output: FlowFile with JSON array of player roster entries
 *
 * Uses Jsoup for HTML parsing (available in NiFi's Groovy classpath)
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
def rows = doc.select('table tbody tr')
def roster = []

rows.each { row ->
    def cells = row.select('td')
    if (cells.size() < 3) return

    def nameText = cells[1].text().trim()
    def firstName = ''
    def lastName = ''

    if (nameText.contains(',')) {
        def parts = nameText.split(',')
        firstName = parts.length > 1 ? parts[1].trim() : ''
        lastName = parts[0].trim()
    } else {
        def parts = nameText.split(/\s+/)
        if (parts.length < 2) return
        firstName = parts[0]
        lastName = parts.drop(1).join(' ')
    }

    if (!firstName || !lastName) return

    def entry = [
        firstName: firstName,
        lastName : lastName,
        position : cells[2].text().trim(),
        classYear: cells.size() > 3 ? cells[3].text().trim() : '',
        height   : cells.size() > 4 ? cells[4].text().trim() : '',
        weight   : cells.size() > 5 ? cells[5].text().trim() : '',
        hometown : cells.size() > 6 ? cells[6].text().trim() : ''
    ]
    roster << entry
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(roster).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', roster.size().toString())
session.transfer(flowFile, REL_SUCCESS)
