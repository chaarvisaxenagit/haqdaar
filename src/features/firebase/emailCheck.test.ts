// Tests for the new-account email check.
import { describe, expect, it } from 'vitest'
import { emailProblem } from './emailCheck'

describe('emailProblem', () => {
  it('accepts normal emails', () => {
    for (const e of ['ramesh.kumar@gmail.com', 'csc.lucknow@yahoo.co.in', 'a_b+1@rediffmail.com', '  Op1@Outlook.com  ']) {
      expect(emailProblem(e)).toBe(null)
    }
  })

  it('rejects badly written emails', () => {
    for (const e of ['', 'ramesh', 'ramesh@', '@gmail.com', 'ramesh@gmail', 'ram esh@gmail.com', 'ramesh@@gmail.com',
      '.ramesh@gmail.com', 'ramesh.@gmail.com', 'ra..mesh@gmail.com', 'ramesh@gmail..com', 'ramesh@-gmail.com', 'ramesh@gmail.c']) {
      expect(emailProblem(e)).toBe('badEmail')
    }
  })

  it('rejects misspelt email services', () => {
    expect(emailProblem('ramesh@gmial.com')).toBe('badEmail')
    expect(emailProblem('ramesh@gmail.con')).toBe('badEmail')
  })

  it('rejects test and throwaway emails', () => {
    for (const e of ['operator1@example.com', 'a@site.test', 'a@mailinator.com', 'a@yopmail.com', 'a@10minutemail.com', 'a@x.mailinator.com']) {
      expect(emailProblem(e)).toBe('tempEmail')
    }
  })
})
