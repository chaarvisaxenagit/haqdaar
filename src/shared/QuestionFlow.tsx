// One question per screen. Used by BOTH farmer mode and operator mode.
// It only collects answers. It never decides eligibility.
import { useState } from 'react'
import type { AnswerField, Answers, Season } from './types'
import { useI18n } from './i18n'
import { BigButton, ListenButton } from './ui'
import schemesData from '../engine/schemes.json'

interface Option {
  value: string
  icon: string
}

interface Question {
  field: AnswerField
  options: Option[]
  noteKey?: string // small line shown under the question
  showIf?: (a: Answers) => boolean
}

const YES_NO: Option[] = [
  { value: 'yes', icon: '👍' },
  { value: 'no', icon: '✋' },
]
const YES_NO_DK: Option[] = [...YES_NO, { value: 'dontKnow', icon: '🤔' }]

// The order of the question screens. Season and crop share one screen (field "season").
const QUESTIONS: Question[] = [
  {
    field: 'land',
    options: [
      { value: 'none', icon: '🚫' },
      { value: 'lt1acre', icon: '🌱' },
      { value: '1to5acre', icon: '🌾' },
      { value: 'gt5acre', icon: '🚜' },
    ],
  },
  { field: 'landAfter2019', options: YES_NO_DK, showIf: (a) => a.land !== 'none' },
  { field: 'tenant', options: YES_NO },
  { field: 'incomeTax', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'pensionOrGovtJob', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'professionalOrPost', options: YES_NO_DK, noteKey: 'q.family.note' },
  { field: 'bankEkyc', options: YES_NO_DK },
  {
    field: 'season',
    options: [
      { value: 'kharif', icon: '🌧️' },
      { value: 'rabi', icon: '❄️' },
    ],
  },
  { field: 'hasKcc', options: YES_NO },
  {
    field: 'soilTest',
    options: [
      { value: 'never', icon: '🚫' },
      { value: 'within2y', icon: '✅' },
      { value: 'over2y', icon: '⏳' },
      { value: 'dontKnow', icon: '🤔' },
    ],
  },
]

const CROP_ICONS: Record<string, string> = { paddy: '🌾', wheat: '🌾', mustard: '🌼', potato: '🥔', other: '🌿' }

function cropsFor(season: Season): string[] {
  return [...schemesData.notifiedCrops[season], 'other']
}

export default function QuestionFlow({
  initial = {},
  onDone,
}: {
  initial?: Answers
  onDone: (answers: Answers) => void
}) {
  const { t } = useI18n()
  const [answers, setAnswers] = useState<Answers>(initial)
  const [step, setStep] = useState(0)

  // Only the screens that apply to this farmer (land cut-off is skipped if no land).
  const visible = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers))
  const q = visible[step]

  function goNext(next: Answers) {
    if (step + 1 >= visible.length) {
      onDone(next)
    } else {
      setStep(step + 1)
    }
  }

  function choose(value: string) {
    let next: Answers = { ...answers, [q.field]: value }
    // Changing the land answer to "none" removes the land cut-off answer.
    if (q.field === 'land' && value === 'none') next = { ...next, landAfter2019: undefined }
    // Changing the season clears a crop from the other season.
    if (q.field === 'season' && answers.season !== value) next = { ...next, crop: undefined }
    setAnswers(next)
    // The season screen waits for the crop before moving on.
    if (q.field !== 'season') goNext(next)
  }

  function chooseCrop(crop: string) {
    const next = { ...answers, crop }
    setAnswers(next)
    goNext(next)
  }

  const questionText = t(`q.${q.field}.text`)
  const cropText = t('q.crop.text')

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-gray-700">
        {t('progress.question', { n: step + 1, total: visible.length })}
      </p>

      <h2 className="text-xl font-bold leading-snug">{questionText}</h2>
      {q.noteKey && <p className="text-base text-gray-700">{t(q.noteKey)}</p>}
      <ListenButton text={q.noteKey ? `${questionText} ${t(q.noteKey)}` : questionText} />

      <div className="flex flex-col gap-3">
        {q.options.map((o) => (
          <BigButton
            key={o.value}
            icon={o.icon}
            selected={answers[q.field] === o.value}
            onClick={() => choose(o.value)}
          >
            {t(`q.${q.field}.opt.${o.value}`)}
          </BigButton>
        ))}
      </div>

      {q.field === 'season' && answers.season && (
        <div className="flex flex-col gap-3 border-t-2 border-gray-200 pt-4">
          <h2 className="text-xl font-bold">{cropText}</h2>
          <ListenButton text={cropText} />
          {cropsFor(answers.season).map((c) => (
            <BigButton
              key={c}
              icon={CROP_ICONS[c] ?? '🌿'}
              selected={answers.crop === c}
              onClick={() => chooseCrop(c)}
            >
              {t(`crop.${c}`)}
            </BigButton>
          ))}
        </div>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="min-h-14 self-start rounded-lg px-4 text-lg font-medium text-green-800 underline"
        >
          ← {t('nav.back')}
        </button>
      )}
    </div>
  )
}
