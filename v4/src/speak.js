// Narration: a recorded clip (public/ses/<id>.mp3, made by scripts/tts.mjs)
// when there is one; otherwise the phone's own Turkish voice.
// Nothing is sent anywhere: clips are static files of this site.
import { clipId } from './narration'
import CLIPS from './clips.json'

const have = new Set(CLIPS.clips)
const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window
let audio = null

export const canSpeak = hasSynth || have.size > 0

export function speak(text, onEnd, audioText = text) {
  stopSpeak()
  const id = clipId(audioText)
  if (have.has(id)) {
    audio = new Audio(`ses/${id}.mp3`)
    audio.onended = audio.onerror = () => onEnd && onEnd()
    audio.play().catch(() => onEnd && onEnd())
    return
  }
  if (!hasSynth) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'tr-TR'
  u.rate = 0.9
  const v = window.speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith('tr'))
  if (v) u.voice = v
  u.onend = u.onerror = () => onEnd && onEnd()
  window.speechSynthesis.speak(u)
}

export function stopSpeak() {
  if (audio) {
    audio.onended = audio.onerror = null
    audio.pause()
    audio = null
  }
  if (hasSynth) window.speechSynthesis.cancel()
}
