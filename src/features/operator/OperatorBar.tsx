// Operator top bar: pending-sync count and the online/offline dot. Always visible in operator mode.
import { useI18n } from '../../shared/i18n'

export default function OperatorBar({ online, pending }: { online: boolean; pending?: number }) {
  const { t } = useI18n()
  return (
    <div className="border-b-2 border-gray-200 bg-gray-50 print:hidden">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-2 text-lg font-medium">
        <span className="flex items-center gap-2" role="status">
          {/* Colour plus text, never colour alone. */}
          <span
            aria-hidden="true"
            className={`inline-block size-4 rounded-full ${online ? 'bg-green-600' : 'bg-red-600'}`}
          />
          {online ? t('op.bar.online') : t('op.bar.offline')}
        </span>
        {pending !== undefined && (
          <span className={pending > 0 ? 'text-amber-900' : 'text-gray-800'}>
            {pending > 0 ? '⏳ ' : '✅ '}
            {t('op.bar.pending', { n: pending })}
          </span>
        )}
      </div>
    </div>
  )
}
