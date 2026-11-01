// One question per screen. Used by BOTH farmer mode and operator mode.
// Tap an answer, then "Next". It only collects answers; it never decides eligibility.
import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { AnswerField, Answers, Season } from './types'
import { useI18n } from './i18n'
import { ListenButton, Nav } from './ui'
import schemesData from '../engine/schemes.json'

interface Option {
  value: string
  icon: string
}

interface Question {
  field: AnswerField
  tile: string // picture on the question
  options: Option[]
  noteKey?: string // small line shown under the question
  showIf?: (a: Answers) => boolean
}

const YES_NO: Option[] = [
  { value: 'yes', icon: '✅' },
  { value: 'no', icon: '❌' },
]
const YES_NO_DK: Option[] = [...YES_NO, { value: 'dontKnow', icon: '❓' }]

// The order of the question screens. Season and crop share one screen (field "season").
const QUESTIONS: Question[] = [
  {
    field: 'state',
    tile: '🗺️',
    options: [
      { value: 'up', icon: '📍' },
      { value: 'mh', icon: '📍' },
      { value: 'pb', icon: '📍' },
      { value: 'tn', icon: '📍' },
      { value: 'tg', icon: '📍' },
      { value: 'wb', icon: '📍' },
      { value: 'other', icon: '🗺️' },
    ],
  },
  {
    field: 'land',
    tile: '🏞️',
    options: [
      { value: 'none', icon: '🚫' },
      { value: 'lt1acre', icon: '🌱' },
      { value: '1to5acre', icon: '🌾' },
      { value: 'gt5acre', icon: '🚜' },
    ],
  },
  { field: 'landAfter2019', tile: '📜', options: YES_NO_DK, showIf: (a) => a.land !== 'none' },
  { field: 'tenant', tile: '🤝', options: YES_NO },
  {
    field: 'age',
    tile: '🎂',
    noteKey: 'q.age.note',
    options: [
      { value: 'under18', icon: '🧒' },
      { value: '18to40', icon: '🧑' },
      { value: '41to59', icon: '🧔' },
      { value: '60plus', icon: '🧓' },
    ],
  },
  { field: 'incomeTax', tile: '🧾', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'pensionOrGovtJob', tile: '🏛️', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'professionalOrPost', tile: '💼', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'bankEkyc', tile: '🏦', options: YES_NO_DK },
  {
    field: 'season',
    tile: '🌾',
    options: [
      { value: 'kharif', icon: '🌧️' },
      { value: 'rabi', icon: '❄️' },
    ],
  },
  { field: 'hasKcc', tile: '💳', options: YES_NO },
  {
    field: 'soilTest',
    tile: '🧪',
    options: [
      { value: 'never', icon: '🚫' },
      { value: 'within2y', icon: '🧪' },
      { value: 'over2y', icon: '⏳' },
      { value: 'dontKnow', icon: '❓' },
    ],
  },
]

const CROP_ICONS: Record<string, string> = {
  paddy: '🍚', bajra: '🌾', urad: '⚫', wheat: '🌾', mustard: '🌼', potato: '🥔', gram: '🫘', lentil: '🟠', other: '🌿',
}

function cropsFor(season: Season): string[] {
  const crops: Record<string, string[]> = schemesData.notifiedCrops
  return [...(crops[season] ?? []), 'other']
}

function visibleQuestions(a: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(a))
}

// One answer button: round dot, emoji, words.
function Opt({ icon, label, selected, onClick, i }: { icon: string; label: string; selected: boolean; onClick: () => void; i: number }) {
  return (
    <button
      type="button"
      className={`opt${selected ? ' sel' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
      style={{ '--i': i } as CSSProperties}
    >
      <span className="radio" aria-hidden="true" />
      <span className="emoji" aria-hidden="true">
        {icon}
      </span>
      <span className="lbl">{label}</span>
    </button>
  )
}

export default function QuestionFlow({
  initial = {},
  onDone,
  onBack,
  who,
  startAtEnd = false,
}: {
  initial?: Answers
  onDone: (answers: Answers) => void
  onBack?: () => void // Back on the first question
  who?: string // e.g. the farmer's name, shown above the question
  startAtEnd?: boolean // open on the last question (when coming back from the next screen)
}) {
  const { t } = useI18n()
  const [answers, setAnswers] = useState<Answers>(initial)
  const [step, setStep] = useState(() => (startAtEnd ? visibleQuestions(initial).length - 1 : 0))

  // Only the screens that apply to this farmer (land cut-off is skipped if no land).
  const visible = visibleQuestions(answers)
  const q = visible[Math.min(step, visible.length - 1)]
  const isSeason = q.field === 'season'
  const answered = isSeason ? !!answers.season && !!answers.crop : answers[q.field] !== undefined

  function choose(value: string) {
    let next: Answers = { ...answers, [q.field]: value }
    // Changing the land answer to "none" removes the land cut-off answer.
    if (q.field === 'land' && value === 'none') next = { ...next, landAfter2019: undefined }
    // Changing the season clears a crop from the other season.
    if (isSeason && answers.season !== value) next = { ...next, crop: undefined }
    setAnswers(next)
  }

  function goNext() {
    if (!answered) return
    if (step + 1 >= visible.length) onDone(answers)
    else setStep(step + 1)
  }

  function goBack() {
    if (step > 0) setStep(step - 1)
    else onBack?.()
  }

  const title = isSeason ? t('q.seasonCrop.text') : t(`q.${q.field}.text`)
  const spoken = [title, q.noteKey ? t(q.noteKey) : ''].filter(Boolean).join(' ')
  const pct = `${Math.round(((step + 1) / visible.length) * 100)}%`

  return (
    <div>
      <div className="q-top">
        <p className="progress">{t('progress.question', { n: step + 1, total: visible.length })}</p>
      </div>
      <div className="field-bar" aria-hidden="true" style={{ '--to': pct } as CSSProperties}>
        <div className="track">
          <span className="fill" />
        </div>
        <span className="tractor">🚜</span>
      </div>

      {who && <p className="who">{who}</p>}
      <div className="q-head">
        <span className="tile3d" aria-hidden="true">
          {q.tile}
        </span>
        <h1>{title}</h1>
      </div>
      {q.noteKey && <p className="qnote">{t(q.noteKey)}</p>}
      <ListenButton text={spoken} />

      <div className="opts">
        {isSeason && <p className="group-label">{t('q.season.group')}</p>}
        {q.options.map((o, i) => (
          <Opt
            key={o.value}
            i={i}
            icon={o.icon}
            label={t(`q.${q.field}.opt.${o.value}`)}
            selected={answers[q.field] === o.value}
            onClick={() => choose(o.value)}
          />
        ))}

        {isSeason && answers.season && (
          <>
            <p className="group-label">{t('q.crop.group')}</p>
            {cropsFor(answers.season).map((c, i) => (
              <Opt
                key={c}
                i={i + 2}
                icon={CROP_ICONS[c] ?? '🌿'}
                label={t(`crop.${c}`)}
                selected={answers.crop === c}
                onClick={() => setAnswers({ ...answers, crop: c })}
              />
            ))}
          </>
        )}
      </div>

      <Nav
        sticky
        back={step > 0 || onBack ? { label: t('nav.back'), onClick: goBack } : undefined}
        next={{ label: t('nav.next'), onClick: goNext, disabled: !answered }}
      />
    </div>
  )
}
