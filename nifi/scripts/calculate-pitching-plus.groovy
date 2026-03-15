/**
 * NiFi ExecuteScript processor: Calculate Pitching+ ratings
 * Process Group: rating-engine
 *
 * Input:  FlowFile with JSON array of pitcher records from ExecuteSQL
 *         (id, kPercent, bbPercent, strikePercent, oppBattingAvg, whip, kPerNine, bbPerNine)
 * Output: FlowFile with JSON array of {id, pitchingPlus} after normalization
 *
 * Ports logic from:
 *   src/agents/rating-engine/pitching-plus.ts
 *   src/agents/rating-engine/normalization.ts
 *   src/models/constants.ts
 */
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

// D1 averages from src/models/constants.ts
def D1 = [
    kPercent     : 0.22,
    bbPercent    : 0.10,
    strikePercent: 0.62,
    oppBattingAvg: 0.270,
    whip         : 1.45,
    kBbRatio     : 2.0
]

// Component weights (must sum to 1.0)
def WEIGHTS = [
    kPercent     : 0.25,
    bbPercent    : 0.20,
    strikePercent: 0.15,
    oppBattingAvg: 0.20,
    whip         : 0.10,
    kBbRatio     : 0.10
]

def flowFile = session.get()
if (!flowFile) return

def jsonText = ''
session.read(flowFile, { inputStream ->
    jsonText = inputStream.getText('UTF-8')
} as InputStreamCallback)

def pitchers = new JsonSlurper().parseText(jsonText)
def scores = [] // [{id, score}]

pitchers.each { p ->
    def components = []

    // K% (higher is better)
    if (p.kPercent != null && p.kPercent > 0) {
        components << [weight: WEIGHTS.kPercent, score: componentScore(p.kPercent, D1.kPercent, false)]
    }

    // BB% (lower is better)
    if (p.bbPercent != null && p.bbPercent > 0) {
        components << [weight: WEIGHTS.bbPercent, score: componentScore(p.bbPercent, D1.bbPercent, true)]
    }

    // Strike% (higher is better)
    if (p.strikePercent != null && p.strikePercent > 0) {
        components << [weight: WEIGHTS.strikePercent, score: componentScore(p.strikePercent, D1.strikePercent, false)]
    }

    // Opp BA (lower is better)
    if (p.oppBattingAvg != null && p.oppBattingAvg > 0) {
        components << [weight: WEIGHTS.oppBattingAvg, score: componentScore(p.oppBattingAvg, D1.oppBattingAvg, true)]
    }

    // WHIP (lower is better)
    if (p.whip != null && p.whip > 0) {
        components << [weight: WEIGHTS.whip, score: componentScore(p.whip, D1.whip, true)]
    }

    // K/BB ratio (higher is better)
    if (p.kPercent != null && p.bbPercent != null && p.bbPercent > 0) {
        def kBbRatio = p.kPercent / p.bbPercent
        components << [weight: WEIGHTS.kBbRatio, score: componentScore(kBbRatio, D1.kBbRatio, false)]
    }

    if (components.size() > 0) {
        def totalWeight = components.sum { it.weight }
        def weightedSum = components.sum { it.score * it.weight }
        def composite = Math.round((weightedSum / totalWeight) * 10) / 10.0
        scores << [id: p.id, score: composite]
    }
}

// Normalize so average = 100
if (scores.size() > 0) {
    def avg = scores.sum { it.score } / scores.size()
    if (avg > 0) {
        def scaleFactor = 100.0 / avg
        scores.each { it.pitchingPlus = Math.round(it.score * scaleFactor * 10) / 10.0 }
    }
} else {
    scores.each { it.pitchingPlus = it.score }
}

def output = scores.collect { [id: it.id, pitchingPlus: it.pitchingPlus] }

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(output).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', output.size().toString())
flowFile = session.putAttribute(flowFile, 'rating.type', 'pitching')
session.transfer(flowFile, REL_SUCCESS)

// --- Helpers ---

def componentScore(double playerValue, double d1Average, boolean lowerIsBetter) {
    if (playerValue == 0 || d1Average == 0) return 100.0
    if (lowerIsBetter) {
        return Math.round(100.0 * d1Average / playerValue * 10) / 10.0
    }
    return Math.round(100.0 * playerValue / d1Average * 10) / 10.0
}
