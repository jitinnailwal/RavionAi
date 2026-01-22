// src/services/creditsService.js
const STORAGE_KEY = 'ravion_credits_v1'
export const STARTING_CREDITS = 2

export function getStoredCredits() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return STARTING_CREDITS
  const n = parseInt(raw, 10)
  return Number.isNaN(n) ? STARTING_CREDITS : n
}

function setStoredCreditsInternal(n) {
  const safe = Math.max(0, Math.floor(Number(n) || 0))
  localStorage.setItem(STORAGE_KEY, String(safe))
  // notify app that credits changed
  window.dispatchEvent(new CustomEvent('ravion_credits_changed', { detail: { credits: safe } }))
  return safe
}

export function setStoredCredits(n) {
  return setStoredCreditsInternal(n)
}

export function addCredits(amount) {
  const cur = getStoredCredits()
  return setStoredCreditsInternal(cur + Number(amount || 0))
}

export function consumeCredits(cost) {
  const cur = getStoredCredits()
  if (cur < cost) return { ok: false, remaining: cur }
  const next = setStoredCreditsInternal(cur - cost)
  return { ok: true, remaining: next }
}
