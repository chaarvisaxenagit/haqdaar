// Turns the farmer's answers into simple facts, so the rules in schemes.json stay simple.
import type { Answers, Facts } from '../shared/types'
import schemesData from './schemes.json'

const notifiedCrops: Record<string, string[]> = schemesData.notifiedCrops

export function getFacts(answers: Answers): Facts {
  // Owns land: land is answered and is not "none".
  const ownsLand = !!answers.land && answers.land !== 'none'
  // Cultivates: owns land, or farms someone else's land.
  const cultivates = ownsLand || answers.tenant === 'yes'
  // Crop notified: the crop is on the district's list for the chosen season.
  const cropNotified =
    !!answers.season && !!answers.crop && (notifiedCrops[answers.season] ?? []).includes(answers.crop)
  return { ownsLand, cultivates, cropNotified }
}
