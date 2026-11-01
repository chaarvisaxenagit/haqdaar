// Turns the farmer's answers into simple facts, so the rules in schemes.json stay simple.
import type { Answers, Facts } from '../shared/types'
import schemesData from './schemes.json'

const notifiedCrops: Record<string, string[]> = schemesData.notifiedCrops

// The state the farmer chose. Records saved before the state question were all Lucknow, UP.
export function stateOf(answers: Answers): string {
  return answers.state ?? schemesData.notifiedState
}

export function getFacts(answers: Answers): Facts {
  // Owns land: land is answered and is not "none".
  const ownsLand = !!answers.land && answers.land !== 'none'
  // Cultivates: owns land, or farms someone else's land.
  const cultivates = ownsLand || answers.tenant === 'yes'
  // Crop notified: the farmer is in the demo district's state and the crop is on its list
  // for the chosen season. Elsewhere we do not know the list, so the farmer must confirm it.
  const cropNotified =
    stateOf(answers) === schemesData.notifiedState &&
    !!answers.season && !!answers.crop && (notifiedCrops[answers.season] ?? []).includes(answers.crop)
  return { ownsLand, cultivates, cropNotified }
}
