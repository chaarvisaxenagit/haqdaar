// Tests for the new-account email check.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkNewEmail, domainCanReceiveMail, editDistance, emailProblem } from './emailCheck'

describe('emailProblem', () => {
  it('accepts normal emails', () => {
    for (const e of ['ramesh.kumar@gmail.com', 'csc.lucknow@yahoo.co.in', 'a_b+1@rediffmail.com', '  Op1@Outlook.com  ',
      'a@ymail.com', 'a@mail.com', 'a@gmx.com', 'a@up.gov.in', 'a@hotmail.co.in', 'a@zohomail.in', 'a@mycsc.in', 'a@rediff.com', 'a@yahoo.co.uk']) {
      expect(emailProblem(e)).toBe(null)
    }
  })

  it('rejects badly written emails', () => {
    for (const e of ['', 'ramesh', 'ramesh@', '@gmail.com', 'ramesh@gmail', 'ram esh@gmail.com', 'ramesh@@gmail.com',
      '.ramesh@gmail.com', 'ramesh.@gmail.com', 'ra..mesh@gmail.com', 'ramesh@gmail..com', 'ramesh@-gmail.com', 'ramesh@gmail.c']) {
      expect(emailProblem(e)?.problem).toBe('badEmail')
    }
  })

  it('rejects misspelt email services and says what was meant', () => {
    const cases: Record<string, string> = {
      'a@gnail.com': 'gmail.com', 'a@gmial.com': 'gmail.com', 'a@gmaul.com': 'gmail.com', 'a@gmai.com': 'gmail.com',
      'a@gmali.com': 'gmail.com', 'a@gmil.com': 'gmail.com', 'a@gmail.cmo': 'gmail.com', 'a@gmail.om': 'gmail.com',
      'a@gmail.comm': 'gmail.com', 'a@gmail.con': 'gmail.com', 'a@gmail.in': 'gmail.com', 'a@gmail.net': 'gmail.com',
      'a@gmail.co.in': 'gmail.com', 'a@gmailcom.com': 'gmail.com', 'a@yahho.com': 'yahoo.com', 'a@yaoo.com': 'yahoo.com',
      'a@hotmal.com': 'hotmail.com', 'a@hotmial.com': 'hotmail.com', 'a@outllok.com': 'outlook.com',
      'a@outlook.cm': 'outlook.com', 'a@redifmail.com': 'rediffmail.com',
      'a@rediffmail.in': 'rediffmail.com', 'a@iclod.com': 'icloud.com',
    }
    for (const [e, meant] of Object.entries(cases)) {
      expect(emailProblem(e), e).toEqual({ problem: 'typo', suggestion: meant })
    }
  })

  it('rejects test and throwaway emails', () => {
    for (const e of ['operator1@example.com', 'a@site.test', 'a@mailinator.com', 'a@yopmail.com', 'a@10minutemail.com', 'a@x.mailinator.com']) {
      expect(emailProblem(e)?.problem).toBe('tempEmail')
    }
  })

  it('counts single-letter changes, including two swapped letters', () => {
    expect(editDistance('gmail.com', 'gmail.com')).toBe(0)
    expect(editDistance('gmial.com', 'gmail.com')).toBe(1)
    expect(editDistance('gnail.com', 'gmail.com')).toBe(1)
    expect(editDistance('gmx.com', 'gmail.com')).toBe(3)
  })
})

// The online check asks DNS. These tests give fake DNS answers, so they need no internet.
function fakeDns(answers: Record<string, object>) {
  vi.stubGlobal('fetch', async (url: string) => {
    const type = new URL(url).searchParams.get('type')!
    return { json: async () => answers[type] ?? { Status: 0 } }
  })
}

describe('domainCanReceiveMail', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('says no when the domain does not exist', async () => {
    fakeDns({ MX: { Status: 3 } })
    expect(await domainCanReceiveMail('asdfghjkl-not-real.com')).toBe(false)
    expect(await checkNewEmail('ramesh@asdfghjkl-not-real.com')).toEqual({ problem: 'noMail' })
  })

  it('says no when the domain says it takes no email', async () => {
    fakeDns({ MX: { Status: 0, Answer: [{ type: 15, data: '0 .' }] } })
    expect(await domainCanReceiveMail('nomail.in')).toBe(false)
  })

  it('says no when there is no mail server and no address', async () => {
    fakeDns({ MX: { Status: 0 }, A: { Status: 0 } })
    expect(await domainCanReceiveMail('empty.in')).toBe(false)
  })

  it('says yes when the domain has a mail server', async () => {
    fakeDns({ MX: { Status: 0, Answer: [{ type: 15, data: '10 mx.mycsc.in.' }] } })
    expect(await domainCanReceiveMail('mycsc.in')).toBe(true)
    expect(await checkNewEmail('op@mycsc.in')).toBe(null)
  })

  it('says yes if the check itself fails, so a bad network never blocks a real person', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('offline')
    })
    expect(await domainCanReceiveMail('mycsc.in')).toBe(true)
  })

  it('never asks DNS about well-known services', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await checkNewEmail('ramesh@gmail.com')).toBe(null)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('stops a typo before asking DNS', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await checkNewEmail('ramesh@gmaul.com')).toEqual({ problem: 'typo', suggestion: 'gmail.com' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
