// Runs every scheme's rules from schemes.json.
// No AI here: the same answers always give the same result.
import type { Answers, DeadlineResult, Scheme, SchemeResult, SchemeStatus, When } from '../shared/types'
import { getFacts, stateOf } from './facts'
import { nextDate } from './dates'
import schemesData from './schemes.json'

export const SCHEMES = schemesData.schemes as Scheme[]

type Values = Record<string, string | boolean | undefined>

// Checks one rule, e.g. { field: "incomeTax", op: "notEquals", value: "yes" }.
export function checkWhen(when: When, values: Values): boolean {
  const v = values[when.field]
  const list = Array.isArray(when.value) ? when.value : [when.value]
  switch (when.op) {
    case 'equals':
      return v === when.value
    case 'notEquals':
      return v !== when.value
    case 'in':
      return typeof v === 'string' && list.includes(v)
    case 'notIn':
      return !(typeof v === 'string' && list.includes(v))
    case 'isTrue':
      return v === true
    case 'isFalse':
      return v === false
  }
}

// Remove repeated keys but keep the order.
function unique(keys: string[]): string[] {
  return [...new Set(keys)]
}

export function evaluateScheme(scheme: Scheme, answers: Answers, today: string): SchemeResult {
  const values: Values = { ...answers, ...getFacts(answers) }

  // Step 1: check every condition (do not stop at the first failure).
  const failed = scheme.conditions.filter((c) => !checkWhen(c, values))
  const firmNo = failed.filter((c) => c.failAs === 'not_eligible')
  const unsure = failed.filter((c) => c.failAs === 'check_office')

  let status: SchemeStatus
  let reasons: string[]
  if (firmNo.length > 0) {
    // Step 2: a firm "no" always wins.
    status = 'likely_not_eligible'
    reasons = firmNo.map((c) => c.failKey)
  } else if (scheme.alreadyHave && checkWhen(scheme.alreadyHave.when, values)) {
    // Step 3: they already have it.
    status = 'already_have'
    reasons = [scheme.alreadyHave.reasonKey]
  } else if (unsure.length > 0) {
    // Step 4: not sure, send them to the office.
    status = 'check_office'
    reasons = unsure.map((c) => c.failKey)
  } else {
    // Step 5: likely eligible, with every reason it passed.
    status = 'likely_eligible'
    reasons = scheme.conditions.map((c) => c.passKey)
  }

  const canApply = status === 'likely_eligible' || status === 'check_office'

  // Tips are not shown when the scheme is likely not for them.
  const tips = status === 'likely_not_eligible' ? [] : scheme.tips.filter((t) => checkWhen(t.when, values)).map((t) => t.key)

  // Season deadlines only count if the farmer chose that season.
  const deadlines: DeadlineResult[] = scheme.deadlines
    .filter((d) => !d.season || d.season === answers.season)
    .map((d) => ({ labelKey: d.labelKey, date: nextDate(d.month, d.day, today) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    schemeId: scheme.id,
    status,
    reasons: unique(reasons),
    tips: unique(tips),
    documents: canApply ? scheme.documents : [],
    deadlines,
    benefitKey: scheme.benefitKey,
    yearlyAmount: scheme.yearlyAmount,
    sourceUrl: scheme.sourceUrl,
    lastVerified: scheme.lastVerified,
  }
}

// Does this scheme apply where the farmer lives? (State schemes only show in their own state.)
export function schemeApplies(scheme: Scheme, answers: Answers): boolean {
  return !scheme.states || (scheme.states as string[]).includes(stateOf(answers))
}

// Results for every scheme that applies, in the order of schemes.json.
export function evaluateAll(answers: Answers, today: string): SchemeResult[] {
  return SCHEMES.filter((s) => schemeApplies(s, answers)).map((s) => evaluateScheme(s, answers, today))
}
