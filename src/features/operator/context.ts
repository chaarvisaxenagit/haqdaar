// Shares the signed-in operator and their live farmer list with every operator screen.
import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { FarmerList } from '../firebase/farmers'

export interface OperatorData {
  user: User
  list: FarmerList
}

export const OperatorContext = createContext<OperatorData | null>(null)

export function useOperatorData(): OperatorData {
  const value = useContext(OperatorContext)
  if (!value) throw new Error('useOperatorData must be used inside OperatorGate')
  return value
}
