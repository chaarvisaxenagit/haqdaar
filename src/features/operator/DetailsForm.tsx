// Name and village, typed by the operator. Used by Register, "Check only" and editing a farmer.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useI18n } from '../../shared/i18n'

export default function DetailsForm({
  nameRequired,
  onDone,
  initialName = '',
  initialVillage = '',
  submitKey = 'reg.next',
}: {
  nameRequired: boolean
  onDone: (name: string, village: string) => void
  initialName?: string
  initialVillage?: string
  submitKey?: string // button text key
}) {
  const { t } = useI18n()
  const [name, setName] = useState(initialName)
  const [village, setVillage] = useState(initialVillage)
  const [showError, setShowError] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (nameRequired && !name.trim()) {
      setShowError(true)
      return
    }
    onDone(name.trim(), village.trim())
  }

  return (
    <form className="login" onSubmit={submit}>
      <label className="field">
        {t('reg.name')}
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      {showError && (
        <p role="alert" className="error">
          ❌ {t('reg.nameRequired')}
        </p>
      )}
      <label className="field">
        {t('reg.village')}
        <input value={village} onChange={(e) => setVillage(e.target.value)} autoComplete="off" />
      </label>
      <button type="submit" className="btn primary">
        {t(submitKey)} →
      </button>
    </form>
  )
}
