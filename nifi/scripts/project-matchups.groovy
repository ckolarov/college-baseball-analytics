/**
 * NiFi ExecuteScript processor: Project pitcher-hitter matchup outcomes
 * Process Group: matchup-modeling
 *
 * Input:  FlowFile with JSON array of pitcher-hitter pairs
 * Output: FlowFile with JSON array of matchup projections
 *
 * Ports logic from src/agents/matchup-modeling/outcome-projector.ts
 * Uses odds-ratio method with 30% regression toward the mean
 */
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

// D1 league averages for matchup modeling
def LEAGUE = [
    battingAvg: 0.270,
    kRate     : 0.20,
    bbRate    : 0.10,
    hrRate    : 0.025
]

def REGRESSION_FACTOR = 0.7  // 30% regression toward mean

def flowFile = session.get()
if (!flowFile) return

def jsonText = ''
session.read(flowFile, { inputStream ->
    jsonText = inputStream.getText('UTF-8')
} as InputStreamCallback)

def pairs = new JsonSlurper().parseText(jsonText)
def matchups = []

pairs.each { pair ->
    // Odds-ratio projections
    def hitterBA = pair.hitterBattingAvg ?: LEAGUE.battingAvg
    def pitcherOppBA = pair.pitcherOppBattingAvg ?: LEAGUE.battingAvg
    def projectedBA = oddsRatio(hitterBA, pitcherOppBA, LEAGUE.battingAvg)

    def hitterKRate = pair.hitterKRate ?: LEAGUE.kRate
    def pitcherKRate = pair.pitcherKPercent ?: LEAGUE.kRate
    def projectedK = oddsRatio(hitterKRate, pitcherKRate, LEAGUE.kRate)

    def hitterBBRate = pair.hitterBBRate ?: LEAGUE.bbRate
    def pitcherBBRate = pair.pitcherBBPercent ?: LEAGUE.bbRate
    def projectedBB = oddsRatio(hitterBBRate, pitcherBBRate, LEAGUE.bbRate)

    // HR rate based on pitcher dominance
    def pitcherDominance = (pair.pitcherPitchingPlus ?: 100) / 100.0
    def projectedHR = LEAGUE.hrRate / pitcherDominance

    // Determine advantage
    def pitchingPlus = pair.pitcherPitchingPlus ?: 100
    def hittingPlus = pair.hitterHittingPlus ?: 100
    def diff = pitchingPlus - hittingPlus

    def advantage = 'NEUTRAL'
    if (diff > 10) advantage = 'PITCHER'
    else if (diff < -10) advantage = 'HITTER'

    matchups << [
        gameId      : pair.gameId,
        pitcherId   : pair.pitcherId,
        hitterId    : pair.hitterId,
        projectedBA : clamp(round3(projectedBA), 0.05, 0.5),
        projectedK  : clamp(round3(projectedK), 0.02, 0.6),
        projectedBB : clamp(round3(projectedBB), 0.01, 0.3),
        projectedHR : clamp(round3(projectedHR), 0.005, 0.1),
        advantage   : advantage
    ]
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(matchups).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', matchups.size().toString())
session.transfer(flowFile, REL_SUCCESS)

// --- Helpers ---

def oddsRatio(double batterRate, double pitcherRate, double leagueRate) {
    if (leagueRate == 0) return leagueRate
    def raw = (batterRate * pitcherRate) / leagueRate
    // 30% regression toward league average
    return raw * REGRESSION_FACTOR + leagueRate * (1 - REGRESSION_FACTOR)
}

def round3(double val) {
    Math.round(val * 1000) / 1000.0
}

def clamp(double val, double min, double max) {
    Math.max(min, Math.min(max, val))
}
