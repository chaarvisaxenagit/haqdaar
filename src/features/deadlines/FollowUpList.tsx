// Operator follow-up list. A farmer is on it if
// (a) a scheme that is likely eligible or "check with office" has a deadline in the next 14 days
//     and the farmer has not applied yet, or
// (b) their follow-up date is today or earlier.
// Sorted by the soonest date.
import { Link } from 'react-router-dom'
import type { FarmerRecord } from '../../shared/types'
import { getFollowUp } from '../../engine/deadlines'
import { useI18n } from '../../shared/i18n'
import { formatDate, todayString } from '../../shared/dates'
import { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { Card, STATUS_ICON } from '../../shared/ui'
import { daysText } from './daysText'

export default function FollowUpList({ farmers }: { farmers: FarmerRecord[] }) {
  const { t } = useI18n()
  const today = todayString()
  const rows = farmers
    .map((farmer) => ({ farmer, item: getFollowUp(farmer, today) }))
    .filter((row) => row.item !== null)
    .sort((a, b) => a.item!.date.localeCompare(b.item!.date))

  return (
    <Card>
      <h2 className="text-xl font-bold">📅 {t('dash.followUp.title')}</h2>
      {rows.length === 0 && <p className="text-lg">{t('followUp.empty')}</p>}
      <ul className="flex flex-col gap-2">
        {rows.map(({ farmer, item }) => (
          <li key={farmer.haqdaarId}>
            <Link
              to={`/o/farmer/${farmer.haqdaarId}`}
              className="flex min-h-14 flex-col gap-1 rounded-xl border-2 border-amber-600 bg-amber-50 px-4 py-2 active:bg-amber-100"
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-lg font-bold">{farmer.name}</span>
                <span className="text-lg font-bold text-amber-900">⏰ {daysText(item!.daysLeft, t)}</span>
              </span>
              <span className="text-base text-gray-800">
                <span className="whitespace-nowrap">{farmer.haqdaarId}</span>
                {farmer.village ? ` · ${farmer.village}` : ''}
              </span>
              <span className="text-base">
                {item!.schemeId && item!.status ? (
                  <>
                    {SCHEME_BY_ID[item!.schemeId].icon} {t(SCHEME_BY_ID[item!.schemeId].nameKey)} ·{' '}
                    {STATUS_ICON[item!.status]} {t(`status.${item!.status}`)} · {formatDate(item!.date, t)}
                  </>
                ) : (
                  <>
                    📌 {t('followUp.dateReached')} · {formatDate(item!.date, t)}
                  </>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
