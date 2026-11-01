// Operator dashboard: sync status, search, follow-up list, my farmers, New farmer, sign-out.
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton } from '../../shared/ui'
import { signOutOperator } from '../firebase/auth'
import { useOnline } from '../firebase/online'
import FollowUpList from '../deadlines/FollowUpList'
import { useOperatorData } from './context'

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const online = useOnline()
  const { user, list } = useOperatorData()
  const [search, setSearch] = useState('')

  // Search by Haqdaar ID (spaces and case ignored), name or village.
  const words = search.trim().toLowerCase()
  const idWords = words.replace(/\s+/g, '').toUpperCase()
  const shown = words
    ? list.farmers.filter(
        (f) =>
          f.name.toLowerCase().includes(words) ||
          (f.village ?? '').toLowerCase().includes(words) ||
          (idWords.length > 0 && f.haqdaarId.replace('-', '').includes(idWords.replace('-', ''))),
      )
    : list.farmers

  // Share of records already in the cloud, for the green bar.
  const total = list.farmers.length
  const syncedPct = total === 0 ? 100 : Math.round(((total - list.pending) / total) * 100)

  return (
    <main className="is-wide">
      <h1>{t('page.dashboard.title')}</h1>
      <p className="muted small">👤 {t('dash.signedInAs', { email: user.email ?? '' })}</p>

      <div className="syncbox">
        <p style={{ margin: '6px 0' }}>
          {list.pending > 0 ? t('dash.sync.pending', { n: list.pending }) : t('dash.sync.all')}
          {list.pending > 0 && !online ? ` ${t('dash.sync.offline')}` : ''}
        </p>
        <div className="syncbar" aria-hidden="true">
          <span style={{ width: `${syncedPct}%` }} />
        </div>
      </div>

      <BigButton icon="➕" variant="primary" narrow onClick={() => navigate('/o/new')}>
        {t('dash.newFarmer')}
      </BigButton>

      <label className="field">
        🔍 {t('dash.search')}
        <input className="search" type="search" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>

      <FollowUpList farmers={words ? shown : list.farmers} />

      <h2>👥 {t('dash.farmers.title', { n: list.farmers.length })}</h2>
      <p className="small muted">{t('dash.ownOnly')}</p>
      {!list.ready && <p>{t('op.loading')}</p>}
      {list.ready && list.farmers.length === 0 && <p className="muted">{t('dash.noFarmers')}</p>}
      {list.ready && list.farmers.length > 0 && shown.length === 0 && <p className="muted">{t('dash.noMatch')}</p>}
      <ul className="rows">
        {shown.map((f, i) => (
          <li key={f.haqdaarId}>
            <Link to={`/o/farmer/${f.haqdaarId}`} className="row" style={{ '--i': i } as CSSProperties}>
              <span className="row-top">
                <span className="avatar" aria-hidden="true">
                  🧑‍🌾
                </span>
                <span className="name">{f.name}</span>
              </span>
              <span className="meta">
                {f.village ? `${f.village} · ` : ''}
                <span className="mono">{f.haqdaarId}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <BigButton icon="🚪" narrow onClick={() => signOutOperator().then(() => navigate('/o/login', { replace: true }))}>
        {t('dash.signOut')}
      </BigButton>
    </main>
  )
}
