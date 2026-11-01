// Operator bar: online/offline dot and pending-sync count. Always visible in operator mode.
import { useI18n } from '../../shared/i18n'

export default function OperatorBar({ online, pending }: { online: boolean; pending?: number }) {
  const { t } = useI18n()
  return (
    <div className="opbar no-print">
      {/* Colour plus text, never colour alone. */}
      <span className={`net ${online ? 'on' : 'off'}`} role="status">
        ● {online ? t('op.bar.online') : t('op.bar.offline')}
      </span>
      {pending !== undefined && <span aria-live="polite">{t('op.bar.pending', { n: pending })}</span>}
    </div>
  )
}
