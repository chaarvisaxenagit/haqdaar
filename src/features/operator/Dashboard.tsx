// Operator dashboard: search, New farmer, sign-out, a place for the follow-up list, and the farmer list.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, Card, Page } from '../../shared/ui'
import { signOutOperator } from '../firebase/auth'
import { useOperatorData } from './context'

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { list } = useOperatorData()
  const [search, setSearch] = useState('')

  // Search by Haqdaar ID (spaces and case ignored) or by name.
  const words = search.trim().toLowerCase()
  const idWords = words.replace(/\s+/g, '').toUpperCase()
  const shown = words
    ? list.farmers.filter(
        (f) => f.name.toLowerCase().includes(words) || (idWords.length > 0 && f.haqdaarId.includes(idWords)),
      )
    : list.farmers

  return (
    <Page title={t('page.dashboard.title')}>
      <BigButton icon="➕" variant="primary" onClick={() => navigate('/o/new')}>
        {t('dash.newFarmer')}
      </BigButton>

      {/* Follow-up list goes here (built with the deadlines feature). */}
      <Card>
        <h2 className="text-xl font-bold">📅 {t('dash.followUp.title')}</h2>
        <p className="text-lg text-gray-800">{t('dash.followUp.soon')}</p>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t('dash.farmers.title', { n: list.farmers.length })}</h2>
        <label className="flex flex-col gap-1 text-lg font-medium">
          🔍 {t('dash.search')}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-14 w-full rounded-lg border-2 border-gray-400 bg-white px-3 text-lg"
          />
        </label>

        {!list.ready && <p className="text-lg">{t('op.loading')}</p>}
        {list.ready && list.farmers.length === 0 && <p className="text-lg">{t('dash.noFarmers')}</p>}
        {list.ready && list.farmers.length > 0 && shown.length === 0 && <p className="text-lg">{t('dash.noMatch')}</p>}

        <ul className="flex flex-col gap-2">
          {shown.map((f) => (
            <li key={f.haqdaarId}>
              <Link
                to={`/o/farmer/${f.haqdaarId}`}
                className="flex min-h-14 flex-col rounded-xl border-2 border-gray-400 bg-white px-4 py-2 active:bg-gray-100"
              >
                <span className="text-lg font-bold">{f.name}</span>
                <span className="text-base text-gray-800">
                  <span className="whitespace-nowrap">{f.haqdaarId}</span>
                  {f.village ? ` · ${f.village}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <BigButton icon="🚪" onClick={() => signOutOperator().then(() => navigate('/o/login', { replace: true }))}>
        {t('dash.signOut')}
      </BigButton>
    </Page>
  )
}
