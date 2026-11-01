// Farmer mode storage. Saves only on this phone (localStorage). Never sent anywhere.
// No Firebase in farmer mode.
import type { Answers, FarmerRecord } from '../../shared/types'
import { makeHaqdaarId } from '../../engine/haqdaarId'

const PREFIX = 'haqdaar.v1.'
const RECORD_KEY = 'haqdaar.v1.record'

// What the screens show right now: the answers, and the Haqdaar ID if saved.
export interface Current {
  answers: Answers
  haqdaarId?: string
}

// Kept in memory for this visit, so results still show if saving was refused or failed.
let current: Current | null = null

export function loadRecord(): FarmerRecord | null {
  try {
    const raw = localStorage.getItem(RECORD_KEY)
    if (!raw) return null
    const record = JSON.parse(raw) as FarmerRecord
    // A damaged record is ignored, so it can never crash a screen.
    return record && record.answers && typeof record.answers === 'object' && typeof record.haqdaarId === 'string'
      ? record
      : null
  } catch {
    return null
  }
}

// Returns false if the phone would not save it.
export function saveRecord(record: FarmerRecord): boolean {
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

// A new record after consent. Keeps the old Haqdaar ID if this phone already has one.
export function makeFarmerRecord(answers: Answers, lang: string, old: FarmerRecord | null): FarmerRecord {
  const now = Date.now()
  return {
    haqdaarId: old?.haqdaarId ?? makeHaqdaarId(),
    name: old?.name ?? '',
    answers,
    statuses: old?.statuses ?? {},
    followUpDate: '',
    lang,
    consentAt: now,
    createdAt: old?.createdAt ?? now,
    updatedAt: now,
  }
}

export function getCurrent(): Current | null {
  if (current) return current
  const record = loadRecord()
  return record ? { answers: record.answers, haqdaarId: record.haqdaarId } : null
}

export function setCurrent(value: Current): void {
  current = value
}

// "Delete my data": removes every haqdaar.v1.* key from this phone.
export function deleteFarmerData(): void {
  current = null
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX)) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  } catch {
    // storage blocked: nothing was saved, so nothing to delete
  }
}
