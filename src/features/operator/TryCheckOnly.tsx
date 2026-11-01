// "Check only" without an account, opened from the sign-in page (#/o/check).
// Lets anyone try operator mode online or offline. Nothing is saved to Firestore.
import { useOnline } from '../firebase/online'
import CheckOnly from './CheckOnly'
import OperatorBar from './OperatorBar'

export default function TryCheckOnly() {
  const online = useOnline()
  return (
    <>
      <OperatorBar online={online} />
      <CheckOnly />
    </>
  )
}
