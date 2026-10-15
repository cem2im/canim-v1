// Narration clips: v4/public/ses/<id>.mp3, one per narrated text (id = clipId(text)).
// The current clips are 'Nora' (ElevenLabs via Higgsfield), made from speakable(text).
//
//   npm run tts:yeni -- --check   lists texts that have no clip (run after any text change;
//                                 those fall back to the phone's own voice)
//   AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=… npm run tts:yeni
//                                 alternative: makes missing clips with Azure Neural
//                                 (AZURE_VOICE, default tr-TR-EmelNeural)
import { mkdirSync, existsSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { BANDS, CONDS, buildList } from '../src/rules.js'
import { INTRO_VOICE, PARENT_INTRO_AUDIO, clipId, narration, speakable } from '../src/narration.js'

const CHECK = process.argv.includes('--check')
const KEY = process.env.AZURE_SPEECH_KEY
const REGION = process.env.AZURE_SPEECH_REGION
const VOICE = process.env.AZURE_VOICE || 'tr-TR-EmelNeural'
if (!CHECK && (!KEY || !REGION)) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.')
  process.exit(1)
}
const OUT = new URL('../public/ses/', import.meta.url)
mkdirSync(OUT, { recursive: true })

// Every list a person can get: sex × age band × none / one / any two conditions.
const ids = CONDS.map((c) => c.id)
const sets = [[]]
ids.forEach((a, i) => { sets.push([a]); ids.slice(i + 1).forEach((b) => sets.push([a, b])) })
const texts = new Set([INTRO_VOICE, PARENT_INTRO_AUDIO])
for (const sex of ['K', 'E']) for (const b of BANDS) for (const conds of sets)
  for (const it of buildList({ sex, band: b.id, conds })) texts.add(narration(it))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const ssml = (t) => `<speak version="1.0" xml:lang="tr-TR"><voice name="${VOICE}"><prosody rate="-8%">${esc(t)}</prosody></voice></speak>`

if (CHECK) {
  const missing = [...texts].filter((t) => !existsSync(new URL(`${clipId(t)}.mp3`, OUT)))
  missing.forEach((t) => console.log(`${clipId(t)}  ${t.slice(0, 70)}…`))
  console.log(`${texts.size} texts, ${missing.length} without a clip`)
  process.exit(missing.length ? 1 : 0)
}
const clips = []
let made = 0
for (const t of texts) {
  const id = clipId(t)
  clips.push(id)
  const file = new URL(`${id}.mp3`, OUT)
  if (existsSync(file)) continue
  const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'canim-tts',
    },
    body: ssml(speakable(t)),
  })
  if (!r.ok) {
    console.error(`Azure ${r.status} for: ${t.slice(0, 60)}…\n${await r.text()}`)
    process.exit(1)
  }
  writeFileSync(file, Buffer.from(await r.arrayBuffer()))
  made++
}
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !clips.includes(f.slice(0, -4))) unlinkSync(new URL(f, OUT))
writeFileSync(new URL('../src/clips.json', import.meta.url), JSON.stringify({ voice: VOICE, clips: clips.sort() }, null, 1) + '\n')
console.log(`${texts.size} texts, ${made} new clips, voice ${VOICE}`)
