// Operator-mode slip address: #/o/farmer/:id/slip. Same Slip page as farmer mode.
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../shared/i18n'
import { BigButton, Page } from '../../shared/ui'
import { useFarmer } from '../firebase/farmers'
import Slip from './Slip'

export default function OperatorSlipPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const { record, ready } = useFarmer(id)
  if (!ready) return <Page title={t('op.loading')} />
  if (!record) {
    return (
      <Page title={t('detail.notFound')}>
        <BigButton icon="🏠" onClick={() => navigate('/o')}>
          {t('detail.back')}
        </BigButton>
      </Page>
    )
  }
  return <Slip farmer={record} onBack={() => navigate(`/o/farmer/${record.haqdaarId}`)} />
}
