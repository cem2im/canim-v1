// Every text Canım reads aloud, in one place. scripts/tts.mjs turns each one
// into an MP3 (Azure Neural); the app plays the MP3 and falls back to the
// phone's own voice when a clip is missing.

export const narration = (it) => `${it.title}. Ne arar? ${it.ne} Nasıl yapılır? ${it.nasil} Sonra ne olur? ${it.sonra}`

export const INTRO_VOICE = 'Merhaba. Canım, annenize, babanıza ya da kendinize yaşa uygun sağlık kontrollerini bir dakikada gösterir. Üç soruya dokunursunuz. Devletin ücretsiz tarama programına ve doktor önerilerine göre bir liste çıkar. Listeyi annenize WhatsApp’tan gönderebilir, 182’yi arayıp aile hekiminden randevu alabilirsiniz. Doktora gösterilecek sayfa da hazır. Üyelik yok, ücretsiz. Hiçbir bilgi kaydedilmez. Teşhis koymaz; karar her zaman doktorunuzundur.'

// The parent's welcome names the sender on screen; the recording uses the
// generic wording because a name can't be recorded in advance.
export const parentIntro = (name) => `Merhaba. Bu sayfayı ${name || 'bir yakınınız'} sizin için hazırladı. Önce bir soruya cevap vereceksiniz. Sonra size uygun kontroller çıkacak. Her birine dokunun, okuyun ya da dinleyin. Randevu hattı 182’yi aramak için bir düğme var. Karar her zaman doktorunuzundur.`
export const PARENT_INTRO_AUDIO = parentIntro('')

// FNV-1a: the clip file name for a text (same in the browser and the script).
export function clipId(text) {
  let h = 0x811c9dc5
  for (const ch of text) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// How the narrator should say what is written. Used only for the recording;
// the clip id always comes from the written text.
const SAY = [
  [/180\/110/g, 'yüz seksene yüz on'],
  [/182/g, 'yüz seksen iki'],
  [/\bB12/g, 'B on iki'],
  [/\bHPV\b/g, 'ha pe ve'],
  [/\bPSA\b/g, 'pe se a'],
  [/\bRSV\b/g, 're se ve'],
  [/\bSGK\b/g, 'se ge ka'],
  [/\bKETEM\b/g, 'Ketem'],
]
export const speakable = (t) => SAY.reduce((s, [re, to]) => s.replace(re, to), t)
