// Name and village, typed by the operator. Used by Register and "Check only".
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

  const input = 'min-h-14 w-full rounded-lg border-2 border-gray-400 bg-white px-3 text-lg'
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-lg font-medium">
        {t('reg.name')}
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={input} />
      </label>
      {showError && (
        <p role="alert" className="text-lg font-medium text-red-800">
          ❌ {t('reg.nameRequired')}
        </p>
      )}
      <label className="flex flex-col gap-1 text-lg font-medium">
        {t('reg.village')}
        <input value={village} onChange={(e) => setVillage(e.target.value)} autoComplete="off" className={input} />
      </label>
      <button
        type="submit"
        className="min-h-14 w-full rounded-xl border-2 border-green-800 bg-green-700 px-4 text-lg font-medium text-white active:bg-green-800"
      >
        {t(submitKey)} →
      </button>
    </form>
  )
}
