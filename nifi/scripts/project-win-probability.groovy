/**
 * NiFi ExecuteScript processor: Project win probability and runs
 * Process Group: schedule-projection
 *
 * Input:  FlowFile with JSON array of games with team ratings
 * Output: FlowFile with JSON array including winProb and projected runs
 *
 * Ports logic from src/agents/schedule-projection/win-probability.ts
 */
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import org.apache.nifi.processor.io.InputStreamCallback
import org.apache.nifi.processor.io.OutputStreamCallback

def HOME_FIELD_ADVANTAGE = 4.0
def D1_AVG_RUNS_PER_GAME = 5.5

def flowFile = session.get()
if (!flowFile) return

def jsonText = ''
session.read(flowFile, { inputStream ->
    jsonText = inputStream.getText('UTF-8')
} as InputStreamCallback)

def games = new JsonSlurper().parseText(jsonText)
def projections = []

games.each { game ->
    def teamPP = game.teamPitchingPlus ?: 100
    def teamHP = game.teamHittingPlus ?: 100
    def oppPP = game.oppPitchingPlus ?: 100
    def oppHP = game.oppHittingPlus ?: 100
    def rpiDiff = (game.teamRpiRating ?: 0.5) - (game.oppRpiRating ?: 0.5)
    def isHome = game.isHome ?: true

    // Offensive edge: our hitting vs their pitching
    def offensiveEdge = teamHP - oppPP

    // Defensive edge: our pitching vs their hitting
    def defensiveEdge = teamPP - oppHP

    // Combined strength differential
    def strengthDiff = offensiveEdge + defensiveEdge

    // Home field advantage
    if (isHome) {
        strengthDiff += HOME_FIELD_ADVANTAGE
    } else {
        strengthDiff -= HOME_FIELD_ADVANTAGE
    }

    // RPI weighting (minor factor)
    strengthDiff += rpiDiff * 20

    // Logistic function
    def scaleFactor = 0.04
    def probability = 1.0 / (1.0 + Math.exp(-scaleFactor * strengthDiff))

    // Clamp to [0.05, 0.95]
    probability = Math.max(0.05, Math.min(0.95, Math.round(probability * 1000) / 1000.0))

    // Project runs: 5.5 * (hittingFactor) * (1/pitchingFactor)
    def homeRuns = Math.round(D1_AVG_RUNS_PER_GAME * (teamHP / 100.0) * (100.0 / oppPP) * 10) / 10.0
    def awayRuns = Math.round(D1_AVG_RUNS_PER_GAME * (oppHP / 100.0) * (100.0 / teamPP) * 10) / 10.0

    projections << (game + [
        homeWinProb       : isHome ? probability : 1 - probability,
        awayWinProb       : isHome ? 1 - probability : probability,
        projectedHomeRuns : isHome ? homeRuns : awayRuns,
        projectedAwayRuns : isHome ? awayRuns : homeRuns
    ])
}

flowFile = session.write(flowFile, { outputStream ->
    outputStream.write(JsonOutput.toJson(projections).getBytes('UTF-8'))
} as OutputStreamCallback)

flowFile = session.putAttribute(flowFile, 'mime.type', 'application/json')
flowFile = session.putAttribute(flowFile, 'record.count', projections.size().toString())
session.transfer(flowFile, REL_SUCCESS)
