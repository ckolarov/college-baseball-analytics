/**
 * NiFi ExecuteScript processor: Calculate Hitting+ ratings
 * Process Group: rating-engine
 *
 * Input:  FlowFile with JSON array of hitter records from ExecuteSQL
 *         (id, battingAvg, obp, slg, ops, kRateHitting, bbRateHitting, isoSlg)
 * Output: FlowFile with JSON array of {id, hittingPlus} after normalization
 *
 * Ports logic from:
 *   src/agents/rating-engine/hitting-plus.ts
 *   src/agents/rating-engine/normalization.ts
 *   src/models/constants.ts
 */
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

// D1 averages
def D1 = [
    battingAvg: 0.270,
    obp       : 0.350,
    slg       : 0.420,
    ops       : 0.770,
    kRate     : 0.20,
    bbRate    : 0.10,
    iso       : 0.150
]

// Component weights (sum = 1.0)
def WEIGHTS = [
    battingAvg: 0.15,
    obp       : 0.20,
    slg       : 0.20,
    ops       : 0.15,
    kRate     : 0.10,
    bbRate    : 0.10,
    iso       : 0.10
]

def flowFile = session.get()
if (!flowFile) return

def jsonText = ''
session.read(flowFile, { inputStream ->
    jsonText = inputStream.getText('UTF-8')
} as InputStreamCallback)

def hitters = new JsonSlurper().parseText(jsonText)
def scores = []

hitters.each { h ->
    def components = []

    // BA (higher is better)
    if (h.battingAvg != null && h.battingAvg > 0) {
        components << [weight: WEIGHTS.battingAvg, score: componentScore(h.battingAvg, D1.battingAvg, false)]
    }

    // OBP (higher is better)
    if (h.obp != null && h.obp > 0) {
        components << [weight: WEIGHTS.obp, score: componentScore(h.obp, D1.obp, false)]
    }

    // SLG (higher is better)
    if (h.slg != null && h.slg > 0) {
        components << [weight: WEIGHTS.slg, score: componentScore(h.slg, D1.slg, false)]
    }

    // OPS (higher is better)
    if (h.ops != null && h.ops > 0) {
        components << [weight: WEIGHTS.ops, score: componentScore(h.ops, D1.ops, false)]
    }

    // K rate (lower is better for hitters)
    if (h.kRateHitting != null && h.kRateHitting > 0) {
        components << [weight: WEIGHTS.kRate, score: componentScore(h.kRateHitting, D1.kRate, true)]
    }

    // BB rate (higher is better)
    if (h.bbRateHitting != null && h.bbRateHitting > 0) {
        components << [weight: WEIGHTS.bbRate, score: componentScore(h.bbRateHitting, D1.bbRate, false)]
    }

    // ISO (higher is better)
    if (h.isoSlg != null && h.isoSlg > 0) {
        components << [weight: WEIGHTS.iso, score: componentScore(h.isoSlg, D1.iso, false)]
    }

    if (components.size() > 0) {
        def totalWeight = components.sum { it.weight }
        def weightedSum = components.sum { it.score * it.weight }
        def composite = Math.round((weightedSum / totalWeight) * 10) / 10.0
        scores << [id: h.id, score: composite]
    }
}

// Normalize so average = 100
if (scores.size() > 0) {
    def avg = scores.sum { it.score } / scores.size()
    if (avg > 0) {
        def scaleFactor = 100.0 / avg
        scores.each { it.hittingPlus = Math.round(it.score * scaleFactor * 10) / 10.0 }
    }
} else {
    scores.each { it.hittingPlus = it.score }
}

def output = scores.collect { [id: it.id, hittingPlus: it.hittingPlus] }

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(output).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', output.size().toString())
flowFile = session.putAttribute(flowFile, 'rating.type', 'hitting')
session.transfer(flowFile, REL_SUCCESS)

def componentScore(double playerValue, double d1Average, boolean lowerIsBetter) {
    if (playerValue == 0 || d1Average == 0) return 100.0
    if (lowerIsBetter) {
        return Math.round(100.0 * d1Average / playerValue * 10) / 10.0
    }
    return Math.round(100.0 * playerValue / d1Average * 10) / 10.0
}
