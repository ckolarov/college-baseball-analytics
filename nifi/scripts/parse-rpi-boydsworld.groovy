/**
 * NiFi ExecuteScript processor: Parse Boydsworld RPI text
 * Process Group: rpi (fallback source)
 *
 * Input:  FlowFile with text from http://boydsworld.com/data/rpi.txt
 * Output: FlowFile with JSON array of RPI entries
 */
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

def flowFile = session.get()
if (!flowFile) return

def text = ''
session.read(flowFile, { inputStream ->
    text = inputStream.getText('UTF-8')
} as InputStreamCallback)

def entries = []

text.eachLine { line ->
    if (!line.trim() || line.startsWith('#') || line.startsWith('Rank')) return

    // Tab or multi-space delimited: Rank  Team  Rating  Record  ConfRecord
    def parts = line.split(/\t+|\s{2,}/).collect { it.trim() }.findAll { it }
    if (parts.size() < 3) return

    try {
        def rank = Integer.parseInt(parts[0].replaceAll(/[^\d]/, ''))
        def teamName = parts[1].replaceAll(/^\d+\.?\s*/, '').trim()
        def rating = Double.parseDouble(parts[2])
        def record = parts.size() > 3 ? parts[3] : ''
        def confRecord = parts.size() > 4 ? parts[4] : ''

        entries << [
            rank            : rank,
            teamName        : teamName,
            rating          : rating,
            record          : record,
            conferenceRecord: confRecord
        ]
    } catch (Exception e) {
        // Skip malformed lines
    }
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(entries).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', entries.size().toString())
session.transfer(flowFile, REL_SUCCESS)
