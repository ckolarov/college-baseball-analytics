/**
 * NiFi ExecuteScript processor: Calculate derived stats
 * Process Group: player-summary
 *
 * Input:  FlowFile with JSON array of SeasonStats records from ExecuteSQL
 * Output: FlowFile with JSON array of update objects {id, field: value, ...}
 *
 * Ports logic from src/agents/player-summary/dashboard-generator.ts
 */
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

def flowFile = session.get()
if (!flowFile) return

def jsonText = ''
session.read(flowFile, { inputStream ->
    jsonText = inputStream.getText('UTF-8')
} as InputStreamCallback)

def records = new JsonSlurper().parseText(jsonText)
def updates = []

records.each { s ->
    def upd = [id: s.id]
    def changed = false

    // OPS = OBP + SLG
    if (s.ops == null && s.obp != null && s.slg != null) {
        upd.ops = round3(s.obp + s.slg)
        changed = true
    }

    // ISO = SLG - BA
    if (s.isoSlg == null && s.slg != null && s.battingAvg != null) {
        upd.isoSlg = round3(s.slg - s.battingAvg)
        changed = true
    }

    // WHIP = (H + BB) / IP
    if (s.whip == null && s.inningsPitched != null && s.inningsPitched > 0) {
        def h = s.hitsAllowed ?: 0
        def bb = s.walks ?: 0
        upd.whip = round3((h + bb) / s.inningsPitched)
        changed = true
    }

    // K/9 = (K / IP) * 9
    if (s.kPerNine == null && s.inningsPitched != null && s.inningsPitched > 0 && s.strikeouts != null) {
        upd.kPerNine = Math.round((s.strikeouts / s.inningsPitched) * 9 * 100) / 100.0
        changed = true
    }

    // BB/9 = (BB / IP) * 9
    if (s.bbPerNine == null && s.inningsPitched != null && s.inningsPitched > 0 && s.walks != null) {
        upd.bbPerNine = Math.round((s.walks / s.inningsPitched) * 9 * 100) / 100.0
        changed = true
    }

    // BABIP = (H - HR) / (AB - K - HR)
    if (s.babip == null && s.hits != null && s.homeRuns != null && s.atBats != null) {
        def k = s.kRateHitting ? Math.round(s.kRateHitting * (s.atBats + (s.walks ?: 0))) : 0
        def denom = s.atBats - k - s.homeRuns
        if (denom > 0) {
            upd.babip = round3((s.hits - s.homeRuns) / (double) denom)
            changed = true
        }
    }

    if (changed) updates << upd
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(updates).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', updates.size().toString())
session.transfer(flowFile, REL_SUCCESS)

def round3(double val) {
    Math.round(val * 1000) / 1000.0
}
