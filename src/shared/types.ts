// Shared types for the whole app.
// These names are the contract between screens, the engine and storage. Do not rename them.

// ---------- 6.1 Answers ----------

export type YesNo = 'yes' | 'no'
export type YesNoDontKnow = 'yes' | 'no' | 'dontKnow'
export type LandSize = 'none' | 'lt1acre' | '1to5acre' | 'gt5acre'
export type Season = 'kharif' | 'rabi'
export type SoilTest = 'never' | 'within2y' | 'over2y' | 'dontKnow'
// up = Uttar Pradesh, mh = Maharashtra, pb = Punjab, tn = Tamil Nadu, tg = Telangana, wb = West Bengal
export type StateCode = 'up' | 'mh' | 'pb' | 'tn' | 'tg' | 'wb' | 'other'
export type AgeBand = 'under18' | '18to40' | '41to59' | '60plus'

// What the questions collect. A field is missing until the farmer answers it.
export interface Answers {
  state?: StateCode // missing in records saved before this question: counts as UP (Lucknow)
  age?: AgeBand
  land?: LandSize
  landAfter2019?: YesNoDontKnow // only asked when land is not "none"
  tenant?: YesNo
  incomeTax?: YesNoDontKnow
  pensionOrGovtJob?: YesNoDontKnow
  professionalOrPost?: YesNoDontKnow
  bankEkyc?: YesNoDontKnow
  season?: Season
  crop?: string // a crop id from schemes.json for the season, or "other"
  hasKcc?: YesNo
  soilTest?: SoilTest
}

export type AnswerField = keyof Answers

// ---------- 6.2 Facts ----------

export interface Facts {
  ownsLand: boolean
  cultivates: boolean
  cropNotified: boolean
}

// ---------- 6.3 Scheme result ----------

export type SchemeStatus =
  | 'likely_eligible'
  | 'likely_not_eligible'
  | 'check_office'
  | 'already_have'

export interface DeadlineResult {
  labelKey: string
  date: string // YYYY-MM-DD
}

// The engine only gives translation keys, never sentences.
export interface SchemeResult {
  schemeId: string
  status: SchemeStatus
  reasons: string[] // always at least one
  tips: string[]
  documents: string[] // only when likely_eligible or check_office
  deadlines: DeadlineResult[]
  benefitKey: string
  yearlyAmount: number // rupees a year if fixed, else 0
  sourceUrl: string
  lastVerified: string // YYYY-MM-DD
}

// ---------- 6.4 Farmer record ----------

// The farmer's real application progress, set by the operator.
export type ApplicationStatus =
  | 'not_started'
  | 'documents_ready'
  | 'applied'
  | 'approved'
  | 'rejected'

export interface FarmerRecord {
  haqdaarId: string // "HQ-" + 8 easy-to-read characters; also the Firestore document ID
  name: string // required in operator mode, optional in farmer mode
  village?: string // operator mode only
  answers: Answers
  statuses: Record<string, ApplicationStatus>
  followUpDate: string // YYYY-MM-DD or ""
  lang: string // a language code from languages.ts
  consentAt: number // ms; no consent = no save
  operatorId?: string // Firebase Auth uid; operator mode only
  createdAt: number // ms, device time
  updatedAt: number // ms, device time
}

// ---------- Section 7: schemes.json shapes ----------

export type ConditionOp = 'equals' | 'notEquals' | 'in' | 'notIn' | 'isTrue' | 'isFalse'

// A field can be an answer or a fact.
export type RuleField = AnswerField | keyof Facts

export interface When {
  field: RuleField
  op: ConditionOp
  value?: string | string[]
}

export interface Condition extends When {
  id: string
  failAs: 'not_eligible' | 'check_office'
  passKey: string
  failKey: string
}

export interface SchemeDeadline {
  season?: Season
  month: number // 1-12
  day: number
  labelKey: string
}

export interface Scheme {
  id: string
  nameKey: string
  icon: string
  benefitKey: string
  yearlyAmount: number
  states?: StateCode[] // only for farmers in these states; missing = all of India
  alreadyHave?: { when: When; reasonKey: string }
  conditions: Condition[]
  tips: { when: When; key: string }[]
  documents: string[]
  deadlines: SchemeDeadline[]
  notes: string[]
  sourceUrl: string
  lastVerified: string
}
