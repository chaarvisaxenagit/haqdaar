// Rules engine tests.
// Written FIRST, before the engine code. The state scheme is skipped on 1 Nov.
import { describe, expect, it } from 'vitest'
import type { Answers, FarmerRecord, SchemeResult, SchemeStatus } from '../shared/types'
import { I18N_FILES, LIVE_LANGUAGES } from '../shared/languages'
import { evaluateAll } from './evaluate'
import { getFollowUp } from './deadlines'
import { makeHaqdaarId } from './haqdaarId'
import schemesData from './schemes.json'

const TODAY = '2026-11-01'

// The "clean" farmer every test starts from.
const CLEAN: Answers = {
  land: '1to5acre',
  landAfter2019: 'no',
  tenant: 'no',
  incomeTax: 'no',
  pensionOrGovtJob: 'no',
  professionalOrPost: 'no',
  bankEkyc: 'yes',
  season: 'rabi',
  crop: 'wheat',
  hasKcc: 'no',
  soilTest: 'within2y',
  state: 'up',
  age: '41to59',
}

// Run the engine on the clean farmer plus some changes. Results by scheme id.
function run(changes: Answers = {}, today = TODAY): Record<string, SchemeResult> {
  const results = evaluateAll({ ...CLEAN, ...changes }, today)
  return Object.fromEntries(results.map((r) => [r.schemeId, r]))
}

function statusesOf(r: Record<string, SchemeResult>): Record<string, SchemeStatus> {
  return Object.fromEntries(Object.entries(r).map(([id, x]) => [id, x.status]))
}

function makeRecord(changes: Answers, extra: Partial<FarmerRecord> = {}): FarmerRecord {
  return {
    haqdaarId: 'HQ-7K2M9QXA',
    name: 'Example Farmer',
    village: 'Example Village',
    answers: { ...CLEAN, ...changes },
    statuses: {},
    followUpDate: '',
    lang: 'hi',
    consentAt: 0,
    operatorId: 'op1',
    createdAt: 0,
    updatedAt: 0,
    ...extra,
  }
}

// Every change used in tests 1-13 and 22-24 (for test 19).
const ALL_CASES: Answers[] = [
  {},
  { land: 'none', tenant: 'no' },
  { land: 'none', tenant: 'yes' },
  { incomeTax: 'yes' },
  { incomeTax: 'dontKnow' },
  { pensionOrGovtJob: 'yes' },
  { professionalOrPost: 'yes' },
  { landAfter2019: 'yes' },
  { incomeTax: 'yes', landAfter2019: 'yes' },
  { bankEkyc: 'no' },
  { crop: 'other' },
  { hasKcc: 'yes' },
  { soilTest: 'never' },
  { land: 'none', tenant: 'no', hasKcc: 'yes' },
  { land: 'none', tenant: 'yes', soilTest: 'within2y' },
  { age: '18to40' },
  { age: '18to40', land: 'gt5acre' },
  { age: '18to40', incomeTax: 'dontKnow' },
  { age: 'under18' },
  { state: 'mh' },
  { state: 'mh', incomeTax: 'yes' },
  { state: 'mh', landAfter2019: 'yes' },
  { state: 'tg' },
  { state: 'tg', age: '60plus' },
  { state: 'tg', land: 'none', tenant: 'yes' },
  { state: 'wb' },
  { state: 'wb', land: 'none', tenant: 'yes' },
  { state: 'wb', land: 'none', tenant: 'no' },
  { state: 'tn' },
  { state: 'tn', land: 'lt1acre' },
  { state: 'tn', land: 'gt5acre' },
  { state: 'tn', land: 'lt1acre', age: '60plus' },
  { state: 'tn', land: 'none', tenant: 'no' },
  { state: 'pb' },
  { state: 'other' },
]

const files = import.meta.glob<Record<string, string>>('../i18n/*/*.json', { eager: true, import: 'default' })

describe('eligibility', () => {
  it('1. clean farmer', () => {
    const r = run()
    expect(r.pmkisan.status).toBe('likely_eligible')
    expect(r.pmfby.status).toBe('likely_eligible')
    expect(r.kcc.status).toBe('likely_eligible')
    expect(r.shc.status).toBe('already_have')
    expect(Object.keys(r).sort()).toEqual(['kcc', 'pmfby', 'pmkisan', 'pmkmy', 'shc'])
  })

  it('2. no land, not a tenant: all likely not eligible (SHC must NOT be already_have)', () => {
    const r = run({ land: 'none', tenant: 'no' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmfby.status).toBe('likely_not_eligible')
    expect(r.kcc.status).toBe('likely_not_eligible')
    expect(r.shc.status).toBe('likely_not_eligible')
  })

  it('3. no land, tenant: PM-KISAN no; PMFBY and KCC yes', () => {
    const r = run({ land: 'none', tenant: 'yes' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.ownsLand.fail')
    expect(r.pmfby.status).toBe('likely_eligible')
    expect(r.kcc.status).toBe('likely_eligible')
  })

  it('4. income tax yes: PM-KISAN no with income-tax reason; others unchanged', () => {
    const clean = statusesOf(run())
    const r = run({ incomeTax: 'yes' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.incomeTax.fail')
    expect({ ...statusesOf(r), pmkisan: clean.pmkisan }).toEqual(clean)
  })

  it('5. income tax not known: PM-KISAN check with office', () => {
    const r = run({ incomeTax: 'dontKnow' })
    expect(r.pmkisan.status).toBe('check_office')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.incomeTax.unsure')
  })

  it('6. pension or govt job: PM-KISAN no with pension/job reason', () => {
    const r = run({ pensionOrGovtJob: 'yes' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.pension.fail')
  })

  it('7. professional or post: PM-KISAN no with professional/post reason', () => {
    const r = run({ professionalOrPost: 'yes' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.professional.fail')
  })

  it('8. land after 2019: PM-KISAN check with office (not a firm no)', () => {
    const r = run({ landAfter2019: 'yes' })
    expect(r.pmkisan.status).toBe('check_office')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.cutoff.fail')
  })

  it('9. a firm "no" beats "check with office"', () => {
    const r = run({ incomeTax: 'yes', landAfter2019: 'yes' })
    expect(r.pmkisan.status).toBe('likely_not_eligible')
    expect(r.pmkisan.reasons).toContain('reason.pmkisan.incomeTax.fail')
  })

  it('10. no e-KYC: PM-KISAN still likely eligible, with the e-KYC tip', () => {
    const r = run({ bankEkyc: 'no' })
    expect(r.pmkisan.status).toBe('likely_eligible')
    expect(r.pmkisan.tips).toContain('tip.pmkisan.ekyc')
  })

  it('11. other crop: PMFBY check with office, confirm notified crop', () => {
    const r = run({ crop: 'other' })
    expect(r.pmfby.status).toBe('check_office')
    expect(r.pmfby.reasons).toContain('reason.pmfby.cropNotified.fail')
  })

  it('11b. Lucknow Kharif 2026 crops count as notified (paddy, bajra, maize, jowar, urad)', () => {
    for (const crop of ['paddy', 'bajra', 'maize', 'jowar', 'urad']) {
      expect(run({ season: 'kharif', crop }).pmfby.status, crop).toBe('likely_eligible')
    }
  })

  it('12. has KCC: KCC already have; PMFBY tip to ask the bank', () => {
    const r = run({ hasKcc: 'yes' })
    expect(r.kcc.status).toBe('already_have')
    expect(r.kcc.reasons).toEqual(['reason.kcc.alreadyHave'])
    expect(r.pmfby.tips).toContain('tip.pmfby.askBank')
  })

  it('13. soil never tested: SHC likely eligible (test due)', () => {
    const r = run({ soilTest: 'never' })
    expect(r.shc.status).toBe('likely_eligible')
    expect(r.shc.reasons).toContain('reason.shc.testDue.pass')
  })

  it('23. no land, no tenancy, has KCC: firm "no" beats already have', () => {
    const r = run({ land: 'none', tenant: 'no', hasKcc: 'yes' })
    expect(r.kcc.status).toBe('likely_not_eligible')
    expect(r.kcc.reasons).toContain('reason.kcc.cultivates.fail')
  })

  it('24. tenant with a recent soil test: SHC already have', () => {
    const r = run({ land: 'none', tenant: 'yes', soilTest: 'within2y' })
    expect(r.shc.status).toBe('already_have')
    expect(r.shc.reasons).toEqual(['reason.shc.recentTest'])
  })

  it.skip('25. state scheme skipped on 1 Nov', () => {})
})

describe('pension scheme (PM-KMY, all India)', () => {
  it('26. age 41-59: PM-KMY likely not eligible (joins only at 18-40)', () => {
    const r = run()
    expect(r.pmkmy.status).toBe('likely_not_eligible')
    expect(r.pmkmy.reasons).toContain('reason.pmkmy.age.fail')
  })

  it('27. age 18-40, small farmer: PM-KMY likely eligible', () => {
    expect(run({ age: '18to40' }).pmkmy.status).toBe('likely_eligible')
  })

  it('28. age 18-40 but more than 5 acres: PM-KMY likely not eligible', () => {
    const r = run({ age: '18to40', land: 'gt5acre' })
    expect(r.pmkmy.status).toBe('likely_not_eligible')
    expect(r.pmkmy.reasons).toContain('reason.pmkmy.smallFarmer.fail')
  })

  it('29. age 18-40, tenant with no land: PM-KMY likely not eligible (needs land in name)', () => {
    const r = run({ age: '18to40', land: 'none', tenant: 'yes' })
    expect(r.pmkmy.status).toBe('likely_not_eligible')
    expect(r.pmkmy.reasons).toContain('reason.pmkmy.ownsLand.fail')
  })

  it('30. age 18-40, income tax not known: PM-KMY check with office', () => {
    expect(run({ age: '18to40', incomeTax: 'dontKnow' }).pmkmy.status).toBe('check_office')
  })
})

describe('state schemes', () => {
  it('31. Maharashtra: Namo Shetkari likely eligible, Rs 6,000 a year', () => {
    const r = run({ state: 'mh' })
    expect(r.namo.status).toBe('likely_eligible')
    expect(r.namo.yearlyAmount).toBe(6000)
    expect(run({ state: 'mh', incomeTax: 'yes' }).namo.status).toBe('likely_not_eligible')
  })

  it('32. Maharashtra, land after 2019: Namo Shetkari check with office', () => {
    expect(run({ state: 'mh', landAfter2019: 'yes' }).namo.status).toBe('check_office')
  })

  it('33. Telangana: Rythu Bharosa and Rythu Bima likely eligible', () => {
    const r = run({ state: 'tg' })
    expect(r.rythuBharosa.status).toBe('likely_eligible')
    expect(r.rythuBima.status).toBe('likely_eligible')
  })

  it('34. Telangana, age 60 or more: Rythu Bima likely not eligible', () => {
    const r = run({ state: 'tg', age: '60plus' })
    expect(r.rythuBima.status).toBe('likely_not_eligible')
    expect(r.rythuBima.reasons).toContain('reason.rythuBima.age.fail')
  })

  it('35. Telangana tenant with no land: Rythu Bharosa check with office, Rythu Bima no', () => {
    const r = run({ state: 'tg', land: 'none', tenant: 'yes' })
    expect(r.rythuBharosa.status).toBe('check_office')
    expect(r.rythuBima.status).toBe('likely_not_eligible')
  })

  it('36. West Bengal: Krishak Bandhu for owners and sharecroppers, not for non-farmers', () => {
    expect(run({ state: 'wb' }).krishakBandhu.status).toBe('likely_eligible')
    expect(run({ state: 'wb', land: 'none', tenant: 'yes' }).krishakBandhu.status).toBe('likely_eligible')
    expect(run({ state: 'wb', land: 'none', tenant: 'no' }).krishakBandhu.status).toBe('likely_not_eligible')
  })

  it('37. Tamil Nadu: Uzhavar Pathukappu depends on land size, age and work', () => {
    expect(run({ state: 'tn', land: 'lt1acre' }).uzhavar.status).toBe('likely_eligible')
    expect(run({ state: 'tn' }).uzhavar.status).toBe('check_office') // 1-5 acres: wet or dry land?
    expect(run({ state: 'tn', land: 'gt5acre' }).uzhavar.status).toBe('likely_not_eligible')
    expect(run({ state: 'tn', land: 'lt1acre', age: '60plus' }).uzhavar.status).toBe('check_office')
    expect(run({ state: 'tn', land: 'none', tenant: 'no' }).uzhavar.status).toBe('check_office') // farm workers
  })

  it('38. a state scheme shows only in its own state', () => {
    const central = ['kcc', 'pmfby', 'pmkisan', 'pmkmy', 'shc']
    expect(Object.keys(run({ state: 'pb' })).sort()).toEqual(central)
    expect(Object.keys(run({ state: 'other' })).sort()).toEqual(central)
    expect(Object.keys(run({ state: 'tg' })).sort()).toEqual([...central, 'rythuBharosa', 'rythuBima'].sort())
  })

  it('39. outside Lucknow, PMFBY asks to confirm the crop is notified', () => {
    const r = run({ state: 'mh' })
    expect(r.pmfby.status).toBe('check_office')
    expect(r.pmfby.reasons).toContain('reason.pmfby.cropNotified.fail')
  })

  it('40. a record saved before the state question counts as Lucknow, UP', () => {
    const r = run({ state: undefined })
    expect(r.pmfby.status).toBe('likely_eligible')
  })
})

describe('deadlines', () => {
  it('14. rabi: PMFBY deadline is 2026-12-31', () => {
    const r = run({ season: 'rabi' }, '2026-11-01')
    expect(r.pmfby.deadlines).toEqual([{ labelKey: 'deadline.pmfby.rabi', date: '2026-12-31' }])
  })

  it('15. kharif paddy: PMFBY deadline is next year, 2027-07-31', () => {
    const r = run({ season: 'kharif', crop: 'paddy' }, '2026-11-01')
    expect(r.pmfby.deadlines).toEqual([{ labelKey: 'deadline.pmfby.kharif', date: '2027-07-31' }])
  })
})

describe('follow-up list', () => {
  it('16. PMFBY likely eligible, not started, 11 days left: on the list', () => {
    const rec = makeRecord({}, { statuses: { pmfby: 'not_started' } })
    expect(getFollowUp(rec, '2026-12-20')).toMatchObject({ schemeId: 'pmfby', daysLeft: 11 })
  })

  it('17. same, but already applied: not on the list', () => {
    const rec = makeRecord({}, { statuses: { pmfby: 'applied' } })
    expect(getFollowUp(rec, '2026-12-20')).toBeNull()
  })

  it('18. follow-up date was yesterday, no near deadline: on the list', () => {
    const rec = makeRecord({}, { statuses: { pmfby: 'not_started' }, followUpDate: '2026-10-31' })
    expect(getFollowUp(rec, '2026-11-01')).not.toBeNull()
  })

  it('22. PMFBY check with office, not started, 11 days left: on the list', () => {
    const rec = makeRecord({ crop: 'other' }, { statuses: { pmfby: 'not_started' } })
    expect(getFollowUp(rec, '2026-12-20')).toMatchObject({
      schemeId: 'pmfby',
      status: 'check_office',
      daysLeft: 11,
    })
  })
})

describe('text keys and IDs', () => {
  it('19. every result has a reason, and every key exists in Hindi and every live language', () => {
    const langs = LIVE_LANGUAGES.map((l) => l.code)
    for (const changes of ALL_CASES) {
      for (const r of Object.values(run(changes))) {
        expect(r.reasons.length, `${r.schemeId} ${JSON.stringify(changes)}`).toBeGreaterThan(0)
        const keys = [...r.reasons, ...r.tips, ...r.documents, r.benefitKey, ...r.deadlines.map((d) => d.labelKey)]
        for (const lang of langs) {
          const engine = files[`../i18n/${lang}/engine.json`] ?? {}
          for (const k of keys) expect(engine[k], `${lang}: ${k}`).toBeDefined()
          expect(engine[`status.${r.status}`], `${lang}: status.${r.status}`).toBeDefined()
        }
      }
    }
    // Names and notes come straight from schemes.json, so check them too.
    for (const s of schemesData.schemes) {
      for (const lang of langs) {
        const engine = files[`../i18n/${lang}/engine.json`] ?? {}
        for (const k of [s.nameKey, ...s.notes]) expect(engine[k], `${lang}: ${k}`).toBeDefined()
      }
    }
  })

  it('20. Haqdaar ID: 10,000 runs, always the right format, no duplicates', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 10000; i++) {
      const id = makeHaqdaarId()
      expect(id).toMatch(/^HQ-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/)
      seen.add(id)
    }
    expect(seen.size).toBe(10000)
  })

  it('21. every live language has all five files with exactly the Hindi keys', () => {
    for (const lang of LIVE_LANGUAGES) {
      for (const f of I18N_FILES) {
        const hi = files[`../i18n/hi/${f}.json`]
        const other = files[`../i18n/${lang.code}/${f}.json`]
        expect(other, `${lang.code}/${f}.json`).toBeDefined()
        expect(Object.keys(other).sort()).toEqual(Object.keys(hi).sort())
      }
    }
  })
})
