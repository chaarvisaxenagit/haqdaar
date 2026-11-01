# Haqdaar (हक़दार)

**Team Root Access** · Catalyst Hack 2026 · Track 07: AgriTech & Rural Innovation

**Team members:** Chaarvi Saxena, Yashi Savita, Vivek Singh, Ishan Singh Bhadoria, Divyanshu Tripathi
**Built by:** Chaarvi Saxena

**Live app:** https://haqdaar-one.vercel.app/

---

## What Haqdaar is

Haqdaar tells a farmer which government schemes they are **likely** eligible for, **why**, which papers to bring, and when each deadline falls. It works fully offline, in Hindi and English.

**A complete assistance system, not just a chatbot.** Rules on the phone decide each result, and every result gives its reason. The farmer gets a paper slip, and the operator gets a follow-up list so nobody misses a deadline.

It has two modes in one app:

- **Farmer mode:** the farmer uses their own phone. No sign-in. Their answers stay on the phone and never leave it.
- **Operator mode:** a CSC operator, gram panchayat worker or agriculture worker signs in, registers the farmer with consent, asks the same questions, prints a slip and follows up before deadlines. This is how Haqdaar reaches farmers who have no smartphone. Records save offline and sync when the internet comes back.

## Use it on a phone

Haqdaar is a website. Open **https://haqdaar-one.vercel.app/** in Chrome, with internet, once. Chrome saves the whole site on the phone, so after that it also works in airplane mode.

To open it like an app, tap ⋮ → **Add to Home screen**. Nothing is downloaded from an app store.

Operator mode needs internet for the first sign-in only.

## Setup (for developers)

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the six `VITE_FIREBASE_*` values from the Firebase console. Never commit `.env`.

```bash
npm run dev
```

```bash
npx vitest run
```

```bash
npm run build
```

**Deploy:** the GitHub repo is linked to Vercel (framework Vite, build `npm run build`, output `dist`, the six `VITE_FIREBASE_*` variables set in Vercel). Every push to `main` deploys automatically. Publish `firestore.rules` in the Firebase console, and add `haqdaar-one.vercel.app` under Authentication → Settings → Authorized domains.

## How it is built

```
┌──────────────────── On the phone (works with no internet) ────────────────────┐
│                                                                               │
│  Questions ──► Rules engine (schemes.json) ──► Results with reasons           │
│  (one per screen,      no AI, same answer          · paper checklist          │
│   Listen button)       every time                  · printable slip + QR      │
│                                                    · deadline reminders       │
│                                                                               │
│  Farmer mode  ──► localStorage (never leaves the phone)                       │
│  Operator mode ──► Firestore offline cache ──► sync queue                     │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │ only when internet returns
                                        ▼
                    ┌──────────── Cloud ────────────┐
                    │  Firebase Firestore           │
                    │  (each operator sees only     │
                    │   their own farmers)          │
                    │  Firebase Auth (operators)    │
                    └───────────────────────────────┘
```

- **One static web app** (Vite + React + TypeScript). No server code.
- **No AI decides eligibility.** The rules engine on the phone decides, and the same answers always give the same result.
- **Rules are data.** Every scheme is an entry in `src/engine/schemes.json`. Adding a scheme or a state means a new entry, not new code.
- **The engine returns only text keys**, never sentences, so the same result shows correctly in every language.
- **Results are not stored.** They are worked out again from the answers each time, so a rules update also fixes old records.
- **The whole app is saved on the phone** on first visit (a PWA with a service worker).

## What works offline

| Feature | Works offline? |
|---|---|
| Questions, with the Listen button (read aloud) | ✅ Yes |
| Eligibility results with reasons | ✅ Yes |
| Checklist of papers to bring | ✅ Yes |
| Printable slip with QR code (Print / Save as PDF) | ✅ Yes |
| Deadline alerts and operator follow-up list | ✅ Yes |
| Saving farmer records (farmer mode and operator mode) | ✅ Yes |
| Switching language | ✅ Yes |
| "Check only" mode when an operator is signed out offline | ✅ Yes |
| Syncing operator records to the cloud | ❌ Needs internet |
| First install and first operator sign-in | ❌ Needs internet |

The read-aloud voice uses the phone's own text-to-speech. The voice data for each language must be installed on the phone.

## Languages

| Language | Live | Checked by | Date |
|---|---|---|---|
| Hindi (हिन्दी) | ✅ | Chaarvi Saxena | 1 Nov 2026 |
| English | ✅ | Chaarvi Saxena | 1 Nov 2026 |

Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese and Urdu are already listed in the app but switched off. A language goes live only after a native speaker has checked every line. We never ship machine-translated text that nobody has checked.

**How to add a language:**

1. Make a folder `src/i18n/<code>/` with the same five files as Hindi: `common.json`, `farmer.json`, `operator.json`, `engine.json`, `slip.json`.
2. A native speaker checks every line.
3. In `src/shared/languages.ts`, set `live: true` for that language.
4. Run `npx vitest run`. A test fails if any key is missing.

No code change is needed.

## Privacy

- **We never store** Aadhaar numbers, bank account numbers, photos of documents, fingerprints or farmers' passwords. We only ask yes/no questions, such as "Is your bank account linked to Aadhaar?"
- **Farmer mode** saves only on the farmer's phone. Nothing is sent anywhere. "Delete my data" removes it.
- **Operator mode** saves a farmer only after the farmer gives consent. The record can be deleted if consent is withdrawn.
- **Operator accounts need a real email.** Badly written, test and throwaway emails are refused, and an account can save nothing until its email is confirmed with the link Firebase sends.
- **Operators see only their own farmers.** This is enforced by the Firestore security rules (`firestore.rules`), not just by the screens.
- The QR code on the slip holds only the Haqdaar ID (for example `HQ-7K2M9QXA`), no personal details.
- Fonts are the phone's own system fonts, so the app downloads nothing extra.

## Schemes and sources

| Scheme | What we checked | Official source | Last verified |
|---|---|---|---|
| PM-KISAN | ₹6,000 a year in 3 instalments; family = husband, wife, minor children; all exclusions; land after 1 Feb 2019; e-KYC required | https://pmkisan.gov.in | 1 Nov 2026 |
| PMFBY crop insurance | Farmer pays at most 2% (Kharif), 1.5% (Rabi food and oilseed crops), 5% (commercial and horticulture crops); helpline 14447; report crop loss within 72 hours | https://pmfby.gov.in (FAQ) and a reply in Parliament (Lok Sabha) | 1 Nov 2026 |
| Kisan Credit Card | Loans at 7%, 4% with prompt repayment; low-interest limit raised from ₹3 lakh to ₹5 lakh; collateral-free up to ₹2 lakh | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2238004 (PIB, 11 Mar 2026) | 1 Nov 2026 |
| Soil Health Card | Scheme running in 2026-27; card every 2 to 3 years (official pages give both) | https://soilhealth.dac.gov.in | 1 Nov 2026 |

**Demo area:** Lucknow district, Uttar Pradesh.

**Notified crops used (draft):** Rabi: wheat, mustard, potato (the UP Rabi 2025-26 list). Kharif: paddy. **PMFBY cut-off dates used (draft):** Rabi 31 Dec, Kharif 31 Jul. On 1 Nov 2026 we could not find the official UP Rabi 2026-27 notification online, so these stay drafts until the district agriculture office or pmfby.gov.in confirms them.

**State scheme left out:** Mukhyamantri Krishak Durghatna Kalyan Yojana, UP (Government Order No. 1/2020/मु0स0-11/एक-9-2020-2एफ/2018, Revenue Section-9, dated 28 Feb 2020). We read the GO text but could not yet confirm it on an official government site. We do not add rules we have not confirmed, so the prototype shows 4 central schemes.

Helplines printed on every slip: Bharat-VISTAAR **155261**, PMFBY **14447**.

## Code and libraries

No code was written before 1 Nov 2026. All the code was written from scratch during the Grand Finale on 1 Nov 2026.

Open-source libraries used (versions installed on 1 Nov 2026):

| Library | Version | Used for |
|---|---|---|
| react, react-dom | 19.3.1 | Screens |
| react-router-dom | 7.18.5 | Pages (HashRouter) |
| firebase | 13.1.0 | Operator sign-in, offline database and sync |
| qrcode | 1.5.4 | QR code on the slip, made on the phone |
| vite | 8.3.5 | Build tool |
| @vitejs/plugin-react | 6.1.2 | React support for Vite |
| typescript | 7.0.2 | Type checking |
| tailwindcss, @tailwindcss/vite | 4.3.3 | Styling |
| vite-plugin-pwa | 2.0.0 | Offline install (service worker) |
| vitest | 5.0.5 | Tests |
| @types/qrcode | 1.5.6 | TypeScript types |

No PDF library is used. The slip is a normal page printed with the browser's Print / Save as PDF, so Hindi prints correctly.

## Honest limits

- It says **"likely eligible"**. The department makes the final decision.
- It cannot submit applications or see a farmer's official application status.
- The rules must be kept up to date by hand when schemes change.
- The prototype covers **4 schemes** and **one demo district (Lucknow, UP)**.
- Only **Hindi and English** are live.
- The notified crop list and PMFBY dates are **drafts** until the UP Rabi 2026-27 notification is confirmed.
- Operator sign-in when the app is reopened with no internet **depends on our real-phone test** (Firebase does not promise this). If sign-in is lost offline, the app switches to "Check only" mode: results and the slip still work, but nothing is saved until the operator signs in online.

## Measured results

| What we measured | Result |
|---|---|
| Automated tests (rules engine, translations and email check) | 31 passing, 1 skipped (the state scheme test, because that scheme is left out) |
| Time to check one farmer | _to fill in after the phone test_ |
| Slip printed in airplane mode | _to fill in after the phone test_ |
| Operator reopened offline, still signed in | _to fill in after the phone test_ |
| Records synced after reconnecting | _to fill in after the phone test_ |

Demo farmers (Ramvati, Suresh, Meena) and village names are fictional examples. No real farmer's data is used.
