// Checks an email before a new operator account is made.
// This catches badly written, test and throwaway emails on the phone.
// A real inbox is then proven by the confirmation link Firebase sends (auth.ts),
// and firestore.rules only lets confirmed emails save anything.

// Reserved names that can never receive email.
const RESERVED_DOMAINS = ['example.com', 'example.org', 'example.net', 'test.com', 'email.com', 'domain.com']
const RESERVED_ENDINGS = ['.test', '.example', '.invalid', '.localhost', '.local']

// Common throwaway ("temporary") email services.
const THROWAWAY_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  'tempmailo.com', 'tempmail.net', 'yopmail.com', 'yopmail.net', 'trashmail.com', 'getnada.com',
  'nada.email', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com',
  'mailnesia.com', 'emailondeck.com', 'mohmal.com', 'burnermail.io', 'mintemail.com',
  'spamgourmet.com', 'mailcatch.com', 'mytemp.email', 'tempinbox.com', 'discard.email',
  'fakemail.net', 'emailfake.com', 'moakt.com', 'tmpmail.org', 'tmail.ws',
]

// Spelling mistakes of common email services.
const TYPO_DOMAINS = [
  'gmial.com', 'gmal.com', 'gamil.com', 'gmaill.com', 'gnail.com', 'gmail.co', 'gmail.con', 'gmail.cm', 'gmail.in',
  'yaho.com', 'yahooo.com', 'yahoo.con', 'hotmial.com', 'hotmai.com', 'hotmail.con', 'outlok.com', 'outlook.con',
  'rediffmail.con', 'redifmail.com',
]

// Letters, numbers and . _ % + - before the @; a domain like name.in or mail.co.in after it.
const SHAPE = /^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/

export type EmailProblem = 'badEmail' | 'tempEmail'

// Returns null if the email looks real, or the kind of problem.
export function emailProblem(raw: string): EmailProblem | null {
  const email = raw.trim().toLowerCase()
  if (email.length > 254 || !SHAPE.test(email)) return 'badEmail'
  const [local, domain] = email.split('@')
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || email.includes('..')) return 'badEmail'
  if (TYPO_DOMAINS.includes(domain)) return 'badEmail'
  if (RESERVED_DOMAINS.includes(domain) || RESERVED_ENDINGS.some((end) => domain.endsWith(end))) return 'tempEmail'
  if (THROWAWAY_DOMAINS.some((d) => domain === d || domain.endsWith('.' + d))) return 'tempEmail'
  return null
}
