// Checks an email before a new operator account is made.
// Step 1 (on the phone): catches badly written, misspelt, test and throwaway emails.
// Step 2 (online): asks the internet's address book (DNS) whether the email's domain can receive mail.
// Step 3: a real inbox is then proven by the confirmation link Firebase sends (auth.ts),
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

// Real email services people in India use. An email at one of these is never called a typo.
const KNOWN_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'yahoo.co.uk', 'hotmail.co.uk', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.in', 'outlook.com', 'outlook.in', 'live.com', 'live.in', 'msn.com',
  'rediffmail.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aim.com', 'mail.com', 'gmx.com',
  'protonmail.com', 'proton.me', 'zoho.com', 'zohomail.in', 'zohomail.com', 'yandex.com', 'nic.in', 'gov.in',
]

// Big services that are often misspelt. A domain very close to one of these is treated as a typo.
const TYPO_TARGETS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com', 'rediffmail.com',
  'icloud.com', 'protonmail.com', 'zohomail.in',
]

// Gmail and Rediffmail only use these exact domains, so "gmail.in" or "gmail.net" is always a typo.
const ONLY_DOMAIN: Record<string, string> = { gmail: 'gmail.com', rediffmail: 'rediffmail.com' }

// Spelling mistakes seen often, kept as a safety net.
const TYPO_DOMAINS: Record<string, string> = {
  'gnail.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
  'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'redifmail.com': 'rediffmail.com',
}

// Letters, numbers and . _ % + - before the @; a domain like name.in or mail.co.in after it.
const SHAPE = /^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/

export type EmailProblem = 'badEmail' | 'tempEmail' | 'typo' | 'noMail'

export interface EmailCheck {
  problem: EmailProblem
  suggestion?: string // the domain they probably meant, e.g. "gmail.com"
}

// How many single-letter changes turn a into b
// (add, remove, change a letter, or swap two letters next to each other).
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

// Returns the big service this domain looks like a misspelling of, or null.
function typoOf(domain: string): string | null {
  if (KNOWN_DOMAINS.includes(domain)) return null
  if (TYPO_DOMAINS[domain]) return TYPO_DOMAINS[domain]
  const first = domain.split('.')[0]
  if (ONLY_DOMAIN[first]) return ONLY_DOMAIN[first]
  // "gmailcom.com", "yahoocom.com": the dot was missed.
  const joined = first.match(/^(gmail|yahoo|hotmail|outlook|rediffmail)(com|co|in|con)$/)
  if (joined) return TYPO_TARGETS.find((d) => d.startsWith(joined[1] + '.')) ?? null
  // One letter off for short names (gmail.com), up to two for longer ones (rediffmail.com).
  for (const target of TYPO_TARGETS) {
    const allowed = target.length >= 11 ? 2 : 1
    if (editDistance(domain, target) <= allowed) return target
  }
  return null
}

// Checks done on the phone, no internet needed. Returns null if the email looks real.
export function emailProblem(raw: string): EmailCheck | null {
  const email = raw.trim().toLowerCase()
  if (email.length > 254 || !SHAPE.test(email)) return { problem: 'badEmail' }
  const [local, domain] = email.split('@')
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || email.includes('..')) return { problem: 'badEmail' }
  if (RESERVED_DOMAINS.includes(domain) || RESERVED_ENDINGS.some((end) => domain.endsWith(end))) return { problem: 'tempEmail' }
  if (THROWAWAY_DOMAINS.some((d) => domain === d || domain.endsWith('.' + d))) return { problem: 'tempEmail' }
  const meant = typoOf(domain)
  if (meant) return { problem: 'typo', suggestion: meant }
  return null
}

// Online check: can this domain receive email at all? Asks Google's public DNS.
// Only the part after @ is sent, never the full email.
// Answers false only when DNS clearly says "no mail here". If the check itself fails
// (slow network, blocked), it answers true, and the confirmation link still protects us.
export async function domainCanReceiveMail(domain: string): Promise<boolean> {
  if (KNOWN_DOMAINS.includes(domain)) return true
  try {
    const ask = async (type: string) => {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
        signal: AbortSignal.timeout(5000),
      })
      return (await res.json()) as { Status: number; Answer?: { type: number; data: string }[] }
    }
    const mx = await ask('MX')
    if (mx.Status === 3) return false // the domain does not exist
    const servers = (mx.Answer ?? []).filter((a) => a.type === 15)
    if (servers.length > 0) {
      // "0 ." means the domain says it takes no email.
      return !servers.every((a) => a.data.trim() === '0 .')
    }
    // No mail servers listed: email can still go to the domain's own address (A record).
    const a = await ask('A')
    return (a.Answer ?? []).some((r) => r.type === 1)
  } catch {
    return true
  }
}

// Both checks together. Used before a new account is made.
export async function checkNewEmail(raw: string): Promise<EmailCheck | null> {
  const local = emailProblem(raw)
  if (local) return local
  const domain = raw.trim().toLowerCase().split('@')[1]
  return (await domainCanReceiveMail(domain)) ? null : { problem: 'noMail' }
}
