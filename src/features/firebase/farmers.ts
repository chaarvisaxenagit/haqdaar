// Reading and saving farmer records in Firestore.
// Rules that matter here:
// - Never await a write. The promise only ends when the server answers, which would freeze the screen offline.
// - Never write while signed out. The rules would reject it later and the change would be lost.
// - Reads use live listeners, which also work from the local cache while offline.
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { FarmerRecord } from '../../shared/types'
import { auth, db } from './init'

const FARMERS = 'farmers'

// The signed-in operator's id, or null if signed out.
function signedInUid(): string | null {
  return auth.currentUser?.uid ?? null
}

// ---------- Writes (never awaited) ----------

// Saves a new or changed farmer record. Returns false (and saves nothing) if signed out
// or if the record belongs to another operator.
export function saveFarmer(record: FarmerRecord): boolean {
  const uid = signedInUid()
  if (!uid || record.operatorId !== uid) return false
  setDoc(doc(db, FARMERS, record.haqdaarId), { ...record, updatedAt: Date.now() }).catch(console.error)
  return true
}

// Changes some fields of a farmer record (for example statuses or followUpDate).
// operatorId and haqdaarId can never be changed here.
export function updateFarmer(
  haqdaarId: string,
  changes: Partial<Omit<FarmerRecord, 'operatorId' | 'haqdaarId'>>,
): boolean {
  if (!signedInUid()) return false
  const safe: Record<string, unknown> = { ...changes, updatedAt: Date.now() }
  delete safe.operatorId
  delete safe.haqdaarId
  updateDoc(doc(db, FARMERS, haqdaarId), safe).catch(console.error)
  return true
}

// Deletes a farmer record (the farmer withdrew consent).
export function deleteFarmer(haqdaarId: string): boolean {
  if (!signedInUid()) return false
  deleteDoc(doc(db, FARMERS, haqdaarId)).catch(console.error)
  return true
}

// ---------- Live reads ----------

export interface FarmerList {
  farmers: FarmerRecord[] // newest change first
  pending: number // records saved on this phone but not yet sent to the cloud
  ready: boolean // false until the first answer (from the cache or the server)
}

// Live list of this operator's farmers, plus the pending-sync count.
// The query MUST include where('operatorId', '==', uid), or the rules reject it.
// No orderBy (it would need an extra index); we sort in the app instead.
export function watchFarmers(uid: string, onChange: (list: FarmerList) => void): () => void {
  const q = query(collection(db, FARMERS), where('operatorId', '==', uid))
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => {
      const farmers = snap.docs.map((d) => d.data() as FarmerRecord).sort((a, b) => b.updatedAt - a.updatedAt)
      const pending = snap.docs.filter((d) => d.metadata.hasPendingWrites).length
      onChange({ farmers, pending, ready: true })
    },
    console.error,
  )
}

export function useFarmers(uid: string | null): FarmerList {
  const [list, setList] = useState<FarmerList>({ farmers: [], pending: 0, ready: false })
  useEffect(() => {
    if (!uid) return
    return watchFarmers(uid, setList)
  }, [uid])
  return uid ? list : { farmers: [], pending: 0, ready: false }
}

// Live view of one farmer record. Gives null if it does not exist (or was deleted).
export function watchFarmer(haqdaarId: string, onChange: (record: FarmerRecord | null) => void): () => void {
  return onSnapshot(
    doc(db, FARMERS, haqdaarId),
    (snap) => onChange(snap.exists() ? (snap.data() as FarmerRecord) : null),
    console.error,
  )
}

export function useFarmer(haqdaarId: string | undefined): { record: FarmerRecord | null; ready: boolean } {
  const [state, setState] = useState<{ id?: string; record: FarmerRecord | null }>({ record: null })
  useEffect(() => {
    if (!haqdaarId) return
    return watchFarmer(haqdaarId, (record) => setState({ id: haqdaarId, record }))
  }, [haqdaarId])
  const ready = !!haqdaarId && state.id === haqdaarId
  return { record: ready ? state.record : null, ready }
}
