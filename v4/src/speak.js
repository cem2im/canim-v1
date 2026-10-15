// Narration placeholder: the device's own Turkish voice (no audio leaves the phone).
// To be replaced by recorded narration once the voice decision is made.

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text, onEnd) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'tr-TR'
  u.rate = 0.9
  const v = window.speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith('tr'))
  if (v) u.voice = v
  u.onend = u.onerror = () => onEnd && onEnd()
  window.speechSynthesis.speak(u)
}

export function stopSpeak() {
  if (canSpeak) window.speechSynthesis.cancel()
}
