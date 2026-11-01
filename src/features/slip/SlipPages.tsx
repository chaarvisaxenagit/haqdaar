// Farmer-mode slip address: #/f/slip. No Firebase here.
// (The operator slip, #/o/farmer/:id/slip, is in OperatorSlipPage.tsx.)
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { makeHaqdaarId } from '../../engine/haqdaarId'
import { useI18n } from '../../shared/i18n'
import { getCurrent } from '../farmer/storage'
import Slip from './Slip'

export function FarmerSlipPage() {
  const { lang } = useI18n()
  const navigate = useNavigate()
  const current = getCurrent()
  // If the farmer chose not to save, the slip still needs an ID. It is made here and not saved.
  const [spareId] = useState(makeHaqdaarId)
  if (!current) return <Navigate to="/f/questions" replace />
  return (
    <Slip
      farmer={{ haqdaarId: current.haqdaarId ?? spareId, answers: current.answers, lang }}
      onBack={() => navigate(-1)}
    />
  )
}
