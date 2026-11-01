// Operator follow-up list. A farmer is on it if
// (a) a scheme that is likely eligible or "check with office" has a deadline in the next 14 days
//     and the farmer has not applied yet, or
// (b) their follow-up date is today or earlier.
// Sorted by the soonest date.
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { FarmerRecord } from '../../shared/types'
import { getFollowUp } from '../../engine/deadlines'
import { useI18n } from '../../shared/i18n'
import { formatDate, todayString } from '../../shared/dates'
import { SCHEME_BY_ID } from '../../shared/SchemeCard'
import { STATUS_ICON } from '../../shared/ui'
import { daysText } from './daysText'

export default function FollowUpList({ farmers }: { farmers: FarmerRecord[] }) {
  const { t } = useI18n()
  const today = todayString()
  const rows = farmers
    .map((farmer) => ({ farmer, item: getFollowUp(farmer, today) }))
    .filter((row) => row.item !== null)
    .sort((a, b) => a.item!.date.localeCompare(b.item!.date))

  return (
    <section>
      <h2>📞 {t('dash.followUp.title')}</h2>
      {rows.length === 0 && <p className="small muted">{t('followUp.empty')}</p>}
      <ul className="rows">
        {rows.map(({ farmer, item }, i) => {
          const scheme = item!.schemeId ? SCHEME_BY_ID[item!.schemeId] : null
          return (
            <li key={farmer.haqdaarId}>
              <Link to={`/o/farmer/${farmer.haqdaarId}`} className="row" style={{ '--i': i } as CSSProperties}>
                <span className="row-top">
                  <span className="avatar" aria-hidden="true">
                    🧑‍🌾
                  </span>
                  <span className="name">{farmer.name}</span>
                  <span className={`days${item!.daysLeft <= 0 ? ' today' : ''}`}>{daysText(item!.daysLeft, t)}</span>
                </span>
                <span className="meta">
                  {farmer.village ? `${farmer.village} · ` : ''}
                  <span className="mono">{farmer.haqdaarId}</span>
                  <br />
                  {scheme && item!.status ? (
                    <>
                      {t(scheme.nameKey)} · {STATUS_ICON[item!.status]} {t(`status.${item!.status}`)} · {formatDate(item!.date, t)}
                    </>
                  ) : (
                    <>
                      📌 {t('followUp.dateReached')} · {formatDate(item!.date, t)}
                    </>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
