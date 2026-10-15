import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { BANDS, CONDS, RULE_DATE, RULE_TABLE, REVIEWED, bandLabel, buildList, condText } from './rules'
import { bookedMessage, giftMessage, listLine, messagesFor, shareMessage, waLink } from './messages'
import { canSpeak, speak, stopSpeak } from './speak'
import { INTRO_VOICE, PARENT_INTRO_AUDIO, narration, parentIntro } from './narration'
import { saveDoctorImage } from './image'

/* ---------- routing: everything lives in the hash, nothing is sent anywhere ---------- */

function useHash() {
  const [h, setH] = useState(window.location.hash)
  useEffect(() => {
    const f = () => setH(window.location.hash)
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const [path, qs = ''] = h.replace(/^#/, '').split('?')
  return { path: path || '/', q: Object.fromEntries(new URLSearchParams(qs)) }
}
const setQuery = (path, q) => {
  const qs = new URLSearchParams(q).toString()
  window.location.hash = `${path}${qs ? `?${qs}` : ''}`
}
const giftUrl = (s, who, name = '') => {
  const q = new URLSearchParams({ y: s.band, c: s.sex, k: who })
  if (name.trim()) q.set('n', name.trim().slice(0, 20))
  return `${window.location.origin}${window.location.pathname}#/a?${q}`
}
const startUrl = () => `${window.location.origin}${window.location.pathname}`
const today = () => new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

/* ---------- small pieces ---------- */

const Spk = ({ s = 30 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="#1C3F6E" />
    <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="#1C3F6E" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
const Chev = () => (
  <svg className="chev" viewBox="0 0 14 22" aria-hidden="true">
    <path d="M3 3l8 8-8 8" fill="none" stroke="#1C3F6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Tel = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
  </svg>
)
const Bubble = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16v10H9l-5 4z" fill="none" stroke="#1C3F6E" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
)
const Cini = () => (
  <svg className="cini" aria-hidden="true">
    <defs>
      <pattern id="star" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#FAF5EA" />
        <g transform="translate(10 10)" fill="#1C3F6E">
          <rect x="-5" y="-5" width="10" height="10" />
          <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" />
        </g>
        <circle cx="10" cy="10" r="2.6" fill="#FAF5EA" />
        <path d="M0 0h20M0 20h20" stroke="#1C3F6E" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="100%" height="20" fill="url(#star)" />
  </svg>
)

function Voice({ title, sub, text, audioText, small, className = '' }) {
  const [on, setOn] = useState(false)
  useEffect(() => () => on && stopSpeak(), [on])
  if (!canSpeak) return null
  const toggle = () => {
    if (on) {
      stopSpeak()
      setOn(false)
    } else {
      setOn(true)
      speak(text, () => setOn(false), audioText ?? text)
    }
  }
  return (
    <button className={`voice ${small ? 'small' : ''} ${className}`} onClick={toggle} aria-label={on ? 'Durdur' : title}>
      <span className="face"><Spk s={small ? 24 : 30} /></span>
      <span className="vt">{title}<span>{on ? 'Dinliyorsunuz…' : sub}</span></span>
      <span className={`play ${on ? 'on' : ''}`} />
    </button>
  )
}

function Sheet({ onClose, children, label }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="bsheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {children}
      </div>
    </div>
  )
}

/* ---------- the list ---------- */

// Extra diabetes checks (PD8, PD14) stay list items but sit behind one row,
// so the core list stays short. The doctor page always shows everything.
const GROUPS = { seker_ek: (n) => `Şekere bağlı diğer ${n} kontrol` }

function ItemList({ items, who, onAsk, onFirstOpen }) {
  const [open, setOpen] = useState(null)
  const [showGroup, setShowGroup] = useState(false)
  const toggle = (id) => {
    setOpen((o) => (o === id ? null : id))
    onFirstOpen?.()
  }
  const canAsk = who === 'anne' || who === 'baba'
  const main = items.filter((it) => !it.group)
  const nPrio = main.filter((it) => it.prio).length
  const extra = items.filter((it) => it.group)
  const row = (it, i) => {
    const isOpen = open === it.id
    return (
      <div key={it.id} className={`li ${isOpen ? 'open' : ''}`}>
        <button className="lihead" aria-expanded={isOpen} onClick={() => toggle(it.id)}>
          <span className="n">{i + 1}</span>
          <span><b>{it.title}</b><span className="f">{it.freq}</span></span>
          <Chev />
        </button>
        {isOpen && (
          <div className="libody qa">
            <Voice small title="Sesli dinleyin" sub="Bu kontrol" text={narration(it)} />
            <p><b>Ne arar?</b> {it.ne}</p>
            <p><b>Nasıl?</b> {it.nasil}</p>
            <p><b>Sonra?</b> {it.sonra}</p>
            <div className="say"><span className="meta" style={{ fontWeight: 700 }}>Doktorunuza sorun:</span><br />“{it.sor}”</div>
          </div>
        )}
        {canAsk && (
          <button className="ask" onClick={() => onAsk(it)}>
            <Bubble />{who === 'baba' ? 'Babana sor' : 'Annene sor'}
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="sheet">
      {main.map((it, i) => (
        <Fragment key={it.id}>
          {nPrio > 0 && i === 0 && <div className="listlabel">Önce bunlar: devletin ücretsiz taramaları</div>}
          {nPrio > 0 && i === nPrio && <div className="listlabel">Diğer kontroller</div>}
          {row(it, i)}
        </Fragment>
      ))}
      {extra.length > 0 && (
        <div className={`li ${showGroup ? 'open' : ''}`}>
          <button className="lihead" aria-expanded={showGroup} onClick={() => setShowGroup((v) => !v)}>
            <span className="n">+</span>
            <span><b>{GROUPS[extra[0].group](extra.length)}</b><span className="f">{extra.map((it) => it.title).join(', ')}</span></span>
            <Chev />
          </button>
        </div>
      )}
      {showGroup && extra.map((it, i) => row(it, main.length + i))}
      <p className="source">Devletin tarama programına ve doktor önerilerine dayanır ({RULE_DATE}). Bakanlık sitesi değildir.</p>
    </div>
  )
}

function AskSheet({ item, who, s, onClose }) {
  const alts = messagesFor(item.msg ?? item.id, who)
  const [pick, setPick] = useState(0)
  const [text, setText] = useState(alts[0])
  const [withLink, setWithLink] = useState(true)
  const out = withLink ? text + listLine(giftUrl(s, who)) : text
  const choose = (i) => {
    setPick(i)
    setText(alts[i])
  }
  return (
    <Sheet onClose={onClose} label="Hazır mesaj">
      <h2>{who === 'baba' ? 'Babanıza sorun' : 'Annenize sorun'}</h2>
      <p className="meta" style={{ marginBottom: 12 }}>{item.title} için bir mesaj seçin. İsterseniz değiştirin.</p>
      <div role="radiogroup">
        {alts.map((a, i) => (
          <button key={i} className="alt" role="radio" aria-checked={pick === i} onClick={() => choose(i)}>
            <span className="radio" /><span>{a}</span>
          </button>
        ))}
      </div>
      <label className="lbl" htmlFor="msg">Gidecek mesaj</label>
      <textarea id="msg" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <label className="chk"><input type="checkbox" checked={withLink} onChange={(e) => setWithLink(e.target.checked)} />{who === 'baba' ? 'Babanızın' : 'Annenizin'} listesinin bağlantısını da ekle</label>
      <a className="btn" style={{ marginTop: 12 }} href={waLink(out)} target="_blank" rel="noopener noreferrer">WhatsApp'ta gönder</a>
      <button className="btn2" onClick={onClose}>Kapat</button>
      <p className="note">Mesajı siz gönderirsiniz. Canım cevaplarınızı kaydetmez.</p>
    </Sheet>
  )
}

function GiftSheet({ who, s, onClose }) {
  const [name, setName] = useState('')
  const [booked, setBooked] = useState(false)
  const url = useMemo(() => giftUrl(s, who, name), [name, s, who])
  const text = booked ? bookedMessage(who, url) : giftMessage(who, url)
  return (
    <Sheet onClose={onClose} label="Gönder">
      <h2>{who === 'baba' ? 'Babanıza gönderin' : 'Annenize gönderin'}</h2>
      <p className="meta" style={{ marginBottom: 10 }}>Açtığı sayfada kendi listesini görür, sesli dinler. Uygulama indirmesi gerekmez.</p>
      <label className="lbl" htmlFor="ad">Adınız (isteğe bağlı)</label>
      <input id="ad" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örneğin: Elif" autoComplete="given-name" />
      <p className="meta" style={{ margin: '8px 0 6px' }}>Sayfada “{name.trim() || 'Biri'} bunu size gönderdi” yazar.</p>
      <label className="chk" style={{ marginBottom: 12 }}><input type="checkbox" checked={booked} onChange={(e) => setBooked(e.target.checked)} />Randevuyu ben aldım (mesaj buna göre yazılsın)</label>
      <a className="btn" href={waLink(text)} target="_blank" rel="noopener noreferrer">WhatsApp'ta gönder</a>
      <button className="btn2" onClick={onClose}>Kapat</button>
      <p className="note">Bağlantıda sağlık bilgisi yok. Yalnızca yaş aralığı, kadın/erkek ve yazarsanız adınız var.</p>
    </Sheet>
  )
}

/* ---------- end of page: call, show, keep ---------- */

function EndSection({ who, onDoctor, onSave, numbered }) {
  const forParent = who === 'anne' || who === 'baba'
  const title = forParent ? 'Randevuyu birlikte alın' : 'Bu ay aile hekiminize gidin'
  const n = (i) => (numbered ? <span className="stepn">{numbered + i}</span> : null)
  return (
    <>
      <section className="sec">
        <h2>{n(0)}{title}</h2>
        {!forParent && <p className="meta">Randevu alabilir ya da randevusuz gidebilirsiniz.</p>}
        <a className="btn" href="tel:182"><Tel />182'yi arayın</a>
        <p className="meta">Randevu hattı. Arama ücreti hattınızın tarifesine göre.</p>
        <div className="script">
          <b>Telefonda:</b><br />“Aile hekiminden randevu istiyorum.”<br />
          {forParent && <>{who === 'baba' ? 'Babanız' : 'Anneniz'} için arıyorsanız: “{who === 'baba' ? 'Babamın' : 'Annemin'} aile hekiminden.”<br /></>}
          <span className="meta">Randevu alınacak kişinin T.C. kimlik numarası yanınızda olsun.</span>
        </div>
      </section>
      <section className="sec">
        <h2>{n(1)}Doktorunuza gösterin</h2>
        <p className="meta">Doktorun okuyacağı büyük yazılı sayfa açılır.</p>
        <button className="btn2" onClick={onDoctor}>Doktora gösterilecek sayfa</button>
      </section>
      <section className="sec">
        <h2>{n(2)}Kaybetmeyin</h2>
        <button className="btn2" onClick={onSave}>Resim olarak kaydet</button>
      </section>
    </>
  )
}

function ShareOn({ kind, who, title, sub, n }) {
  return (
    <section className="sec">
      <h2>{n ? <span className="stepn">{n}</span> : null}{title}</h2>
      <p className="meta">{sub}</p>
      <a className="btn2" href={waLink(shareMessage(kind, who, startUrl()))} target="_blank" rel="noopener noreferrer">WhatsApp'ta paylaşın</a>
    </section>
  )
}

function Foot() {
  return (
    <footer className="foot">
      <p>Canım bilgilendirme amaçlıdır, teşhis koymaz. Karar hekiminizindir.</p>
      <p style={{ marginTop: 6 }}>Cevaplarınız bu telefonda kalır. Canım bunları kaydetmez, kimseye göndermez. <a href="#/gizlilik">Gizlilik</a> · <a href="#/kaynak">Hekimler için: kurallar ve kaynaklar</a></p>
    </footer>
  )
}

/* ---------- doctor page ---------- */

function DoctorPage({ s, items, onBack }) {
  const { meta, footer } = doctorData(s, items)
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <div className="doc" role="dialog" aria-modal="true" aria-label="Doktora gösterilecek sayfa">
      <div className="inner">
        <div className="top" style={{ padding: '0 12px' }}>
          <button className="geri" onClick={onBack} ref={ref}>‹ Listeye dön</button>
          <span className="wm">Canım</span>
        </div>
        <p style={{ padding: '0 20px 10px', fontWeight: 700, color: 'var(--cini)' }}>Bu sayfayı doktorunuza uzatın.</p>
        <div className="docsheet">
          <div className="meta">Sayın Doktor,</div>
          <h2 style={{ fontSize: 26 }}>Bu kontrolleri sizinle konuşmak istiyorum</h2>
          <p className="meta" style={{ marginBottom: 8 }}>{meta}</p>
          {items.map((it, i) => (
            <div className="row" key={it.id}>
              <span className="n">{i + 1}</span>
              <div>
                <b>{it.doctor}</b>
                {it.doctorSub && <span className="sub">{it.doctorSub}</span>}
                <span className="tag">{it.tag}</span>
              </div>
            </div>
          ))}
          {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 8 }}>Ayrıca: {s.other || 'başka bir sağlık durumu'} (kendisi söyledi). Bu durumun kontrolleri ve aşıları ayrıca değerlendirilmeli.</p>}
          <p className="meta" style={{ marginTop: 12, fontSize: 16 }}>{footer}</p>
        </div>
      </div>
      <div className="sticky" style={{ maxWidth: 640, margin: '0 auto' }}>
        <button className="btn" onClick={() => saveDoctorImage({ meta, items, footer })}>Resim olarak kaydet</button>
      </div>
    </div>
  )
}

/* ---------- shared pieces for the step screens ---------- */

const WHO = [
  { id: 'kendim', label: 'Kendim' },
  { id: 'anne', label: 'Annem' },
  { id: 'baba', label: 'Babam' },
  { id: 'baska', label: 'Başka biri' },
]
const SEX = [{ id: 'K', label: 'Kadın' }, { id: 'E', label: 'Erkek' }]
const NONE = { id: 'yok', label: 'Yok' }

function pickConds(prev, id) {
  if (id === 'yok') return ['yok']
  const p = prev.filter((x) => x !== 'yok')
  return p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
}

function useFlash(ms = 2500) {
  const [on, setOn] = useState(false)
  const t = useRef(0)
  const fire = () => {
    setOn(true)
    clearTimeout(t.current)
    t.current = setTimeout(() => setOn(false), ms)
  }
  useEffect(() => () => clearTimeout(t.current), [])
  return [on, fire]
}

// One screen: back button, wordmark, progress; the action sits at the bottom.
function Screen({ back = true, progress, children, action }) {
  return (
    <div className="screen">
      <header className="top">
        {back ? <button className="geri" onClick={() => window.history.back()}>‹ Geri</button> : <span className="wm">Canım</span>}
        {progress ? <span className="meta" style={{ fontSize: 18 }}>{progress}</span> : back ? <span className="wm">Canım</span> : <span className="meta" style={{ fontSize: 18 }}>Üyelik yok · ücretsiz</span>}
      </header>
      <div className="screen-body">{children}</div>
      {action && <div className="sticky">{action}</div>}
    </div>
  )
}

// Full-width answer rows. A single choice moves on by itself after a short beat.
function Options({ options, value, multi, onPick }) {
  const on = (id) => (multi ? value.includes(id) : value === id)
  return (
    <div role={multi ? 'group' : 'radiogroup'}>
      {options.map((o) => (
        <button key={o.id} className="opt" role={multi ? 'checkbox' : 'radio'} aria-checked={on(o.id)} onClick={() => onPick(o.id)}>
          <span className={multi ? 'box' : 'radio'} />{o.label}
        </button>
      ))}
    </div>
  )
}
const after = (fn) => setTimeout(fn, 220)

// Free text for "Diğer". It stays on the phone and only appears on the doctor page.
function OtherField({ value, onChange }) {
  return (
    <div style={{ marginTop: 6 }}>
      <label className="lbl" htmlFor="diger">Hangisi? (isteğe bağlı)</label>
      <input id="diger" type="text" maxLength={60} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Örneğin: tiroid, astım, romatizma" autoComplete="off" />
      <p className="meta" style={{ marginTop: 6 }}>Yalnızca doktor sayfasına yazılır. Hiçbir yere gönderilmez.</p>
    </div>
  )
}

/* ---------- intro ---------- */


// First screen = first question: a one-line promise, then "Kimin için?".
// The explanation sits below for those who scroll; the parent link keeps its own welcome.
function IntroPage({ a, setA }) {
  const pick = (id) => {
    setA({ ...a, who: id, band: id !== a.who ? null : a.band })
    after(() => { window.location.hash = `/s/${id === 'kendim' || id === 'baska' ? 'cins' : 'yas'}` })
  }
  return (
    <div className="screen">
      <header className="top"><span className="wm">Canım</span><span className="meta" style={{ fontSize: 18 }}>Üyelik yok · ücretsiz</span></header>
      <div className="band hero slim">
        <div className="t">Yaşa uygun sağlık kontrolleri, bir dakikada.</div>
        <div className="sub">Mamografi, bağırsak testi, tahliller, aşılar: hangisi ne zaman, hangisi ücretsiz?</div>
      </div>
      <Cini />
      <section className="sec" style={{ border: 0, paddingBottom: 6 }}>
        <div className="qrow"><h1 style={{ margin: 0 }}>Kimin için?</h1><span className="meta">Soru 1</span></div>
        <Options options={WHO} value={a.who} onPick={pick} />
      </section>
      <section className="sec" style={{ paddingTop: 4 }}>
        <Voice small title="Sesli dinleyin" sub="Canım nedir? · 36 saniye" text={INTRO_VOICE} />
      </section>
      <section className="sec">
        <h2>Nasıl çalışır?</h2>
        <ol className="steps">
          <li><span className="n">1</span><div><b>Üç soruya dokunun</b><span>Kimin için, kaç yaşında, takip edilen bir sağlık durumu var mı.</span></div></li>
          <li><span className="n">2</span><div><b>Listeyi görün</b><span>Her kontrolü okuyun ya da sesli dinleyin: ne arar, nasıl yapılır, ücretsiz mi.</span></div></li>
          <li><span className="n">3</span><div><b>Gönderin, randevu alın</b><span>Annenize WhatsApp'tan gönderin. 182'yi arayın. Doktora gösterilecek sayfa hazır.</span></div></li>
        </ol>
        <ul className="trust">
          <li>Devletin tarama programına ve kılavuzlara dayanır; hekim kontrolünden geçti.</li>
          <li>Cevaplarınız kaydedilmez.</li>
          <li>Teşhis koymaz. Karar hekiminizindir.</li>
        </ul>
      </section>
      <Foot />
    </div>
  )
}

/* ---------- child flow: one question per screen ---------- */

function ChildFlow({ route, a, setA }) {
  const step = route.path.split('/')[2] || 'kim'
  const [ask, setAsk] = useState(null)
  const [gift, setGift] = useState(false)
  const { who, sexPick, band, conds } = a
  const sex = who === 'anne' ? 'K' : who === 'baba' ? 'E' : sexPick
  const needSex = who === 'kendim' || who === 'baska'
  const parent = who === 'anne' || who === 'baba'
  const s = { sex, band, conds: conds.filter((c) => c !== 'yok'), other: conds.includes('baska') ? (a.other || '').trim() : '' }
  const done = who && sex && band && conds.length > 0
  const items = done ? buildList(s) : []
  const bands = parent ? BANDS.filter((b) => b.id >= 40) : BANDS
  const total = needSex ? 4 : 3
  const nth = { kim: 1, cins: 2, yas: needSex ? 3 : 2, durum: needSex ? 4 : 3 }[step]

  // A deep link or reload into a later step goes back to the first unanswered one.
  const missing = !who ? 'kim' : !sex ? 'cins' : !band ? 'yas' : !conds.length ? 'durum' : null
  const order = ['kim', 'cins', 'yas', 'durum', 'liste', 'son']
  const needs = { cins: who, yas: sex, durum: band, liste: done, son: done }
  useEffect(() => {
    if (step in needs && !needs[step] && missing) window.location.replace(missing === 'kim' ? '#/' : `#/s/${missing}`)
  })
  if (!order.includes(step)) return null

  const go = (to) => { window.location.hash = `/s/${to}` }
  const ageQ = { anne: 'Annenizin yaşı?', baba: 'Babanızın yaşı?', kendim: 'Yaşınız?', baska: 'Kaç yaşında?' }[who] || 'Yaşı?'
  const condQ = who === 'kendim' ? 'Doktorunuzun takip ettiği bir sağlık durumunuz var mı?' : 'Doktorunun takip ettiği bir sağlık durumu var mı?'
  const listTitle = { anne: 'Annenizin', baba: 'Babanızın', kendim: 'Sizin', baska: 'Onun' }[who]
  const toParent = who === 'baba' ? 'Babanıza' : 'Annenize'
  const openDoctor = () => setQuery(route.path, { d: 1 })
  const progress = nth ? `Soru ${nth} / ${total}` : null

  let screen
  if (step === 'kim') {
    screen = (
      <Screen progress={progress}>
        <section className="sec" style={{ border: 0 }}>
          <h1>Kimin için?</h1>
          <p className="meta" style={{ marginBottom: 14 }}>Listeyi kimin için hazırlıyorsunuz?</p>
          <Options options={WHO} value={who} onPick={(id) => {
            setA({ ...a, who: id, band: id !== who ? null : band })
            after(() => go(id === 'kendim' || id === 'baska' ? 'cins' : 'yas'))
          }} />
        </section>
      </Screen>
    )
  } else if (step === 'cins') {
    screen = (
      <Screen progress={progress}>
        <section className="sec" style={{ border: 0 }}>
          <h1>Kadın mı, erkek mi?</h1>
          <p className="meta" style={{ marginBottom: 14 }}>Bazı kontroller yalnızca kadınlar ya da erkekler için.</p>
          <Options options={SEX} value={sexPick} onPick={(id) => { setA({ ...a, sexPick: id }); after(() => go('yas')) }} />
        </section>
      </Screen>
    )
  } else if (step === 'yas') {
    screen = (
      <Screen progress={progress}>
        <section className="sec" style={{ border: 0 }}>
          <h1>{ageQ}</h1>
          <p className="meta" style={{ marginBottom: 14 }}>Kontroller yaşa göre değişir.</p>
          <Options options={bands} value={band} onPick={(id) => { setA({ ...a, band: id }); after(() => go('durum')) }} />
        </section>
      </Screen>
    )
  } else if (step === 'durum') {
    const some = conds.length > 0 && !conds.includes('yok')
    screen = (
      <Screen progress={progress} action={some ? <button className="btn" onClick={() => go('liste')}>Listeyi göster</button> : null}>
        <section className="sec" style={{ border: 0 }}>
          <h1>{condQ}</h1>
          <p className="meta" style={{ marginBottom: 14 }}>İlaç, iğne ya da diyetle. Birden fazla seçebilirsiniz.</p>
          <Options options={[NONE, ...CONDS]} value={conds} multi onPick={(id) => {
            setA({ ...a, conds: pickConds(conds, id) })
            if (id === 'yok') after(() => go('liste'))
          }} />
          {conds.includes('baska') && <OtherField value={a.other} onChange={(v) => setA({ ...a, other: v })} />}
        </section>
      </Screen>
    )
  } else if (step === 'liste' && done) {
    screen = (
      <Screen action={parent
        ? <>
            <p className="stickynote">182’de: “{who === 'baba' ? 'Babamın' : 'Annemin'} aile hekiminden randevu istiyorum.” {who === 'baba' ? 'Babanızın' : 'Annenizin'} T.C. kimlik no’su hazır olsun.</p>
            <a className="btn" href="tel:182"><Tel />Randevuyu siz alın: 182</a>
            <button className="btn2" onClick={() => setGift(true)}>{toParent} gönderin</button>
          </>
        : <><a className="btn" href="tel:182"><Tel />182'yi arayın, randevu alın</a><button className="btn2" onClick={() => go('son')}>Sonra ne yapmalı? →</button></>}>
        <section className="sec" style={{ border: 0 }} aria-live="polite">
          <h1 style={{ fontSize: 29 }}>{listTitle} {items.length} kontrolü</h1>
          <p className="meta" style={{ marginBottom: 10 }}>
            {parent ? `Bir kontrole dokunun, okuyun. Her birini ${who === 'baba' ? 'babanıza' : 'annenize'} sorabilirsiniz; hazır bir mesaj yazdık.` : 'Bir kontrole dokunun, ne olduğunu okuyun ya da dinleyin.'}
          </p>
          <ItemList items={items} who={who} onAsk={setAsk} />
          {band === 18 && <p className="meta" style={{ marginTop: 10 }}>Bu yaşta liste kısa: taramaların çoğu ileride başlar{sex === 'K' ? ' (rahim ağzı testi 30, kan şekeri 35, kolesterol 40 yaşında)' : ' (kan şekeri 35, kolesterol 40 yaşında)'}. Takip edilen bir sağlık durumu varsa onun kontrolleri yaşa bakmaz.</p>}
          {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 10 }}>{s.other ? `${s.other} için` : 'Diğer sağlık durumu için'} kontrolleri ve aşıları onu takip eden doktora sorun. Doktor sayfasına da yazdık.</p>}
          {parent && <button className="btn2" style={{ marginTop: 16 }} onClick={() => go('son')}>Doktor sayfası ve diğer adımlar →</button>}
        </section>
        {who === 'kendim' && (
          <section className="sec">
            <h2>Anneniz ve babanız için de bakın</h2>
            <p className="meta">Onların listesi genellikle daha uzun.</p>
            {['anne', 'baba'].map((w) => (
              <button key={w} className="btn2" onClick={() => { setA({ who: w, sexPick: null, band: null, conds: [], other: '' }); go('yas') }}>{w === 'anne' ? 'Annem için' : 'Babam için'}</button>
            ))}
          </section>
        )}
      </Screen>
    )
  } else if (step === 'son' && done) {
    screen = (
      <Screen>
        <section className="sec" style={{ border: 0, paddingBottom: 0 }}>
          <h1>Şimdi ne yapmalı?</h1>
        </section>
        {parent && (
          <section className="sec">
            <h2><span className="stepn">1</span>{toParent} gönderin</h2>
            <p className="meta">Kendi listesini görür, sesli dinler. Uygulama indirmesi gerekmez.</p>
            <button className="btn" style={{ marginTop: 10 }} onClick={() => setGift(true)}>WhatsApp'ta gönderin</button>
          </section>
        )}
        <EndSection who={who} onDoctor={openDoctor} onSave={() => saveDoctorImage(doctorData(s, items))} numbered={parent ? 2 : 1} />
        {parent
          ? <ShareOn kind="kardes" who={who} n={5} title="Kardeşlerinize haber verin" sub="Birlikte halletmek daha kolay. Bağlantı başlangıç sayfasını açar; kimsenin bilgisi gitmez." />
          : <ShareOn kind="genel" who={who} n={4} title="Bir yakınınıza gönderin" sub="Bağlantı başlangıç sayfasını açar; sizin bilginiz gitmez." />}
        <Foot />
      </Screen>
    )
  } else {
    return null
  }

  return (
    <>
      {screen}
      {ask && <AskSheet item={ask} who={who} s={s} onClose={() => setAsk(null)} />}
      {gift && <GiftSheet who={who} s={s} onClose={() => setGift(false)} />}
      {route.q.d && done && <DoctorPage s={s} items={items} onBack={() => window.history.back()} />}
    </>
  )
}

function doctorData(s, items) {
  return {
    meta: `${bandLabel(s.band)} yaş · ${s.sex === 'K' ? 'kadın' : 'erkek'}${s.conds.length ? ` · ${condText(s.conds).replace('diğer', s.other || 'diğer')} (kendisi söyledi)` : ''} · ${today()}`,
    items,
    footer: `Bilgilendirme amaçlıdır; karar hekimindir. Kurallar: Sağlık Bakanlığı tarama programları ve güncel kılavuzlar, ${RULE_DATE}.`,
  }
}

/* ---------- parent flow: welcome → question → list → next steps ---------- */

function ParentPage({ route }) {
  const band = Number(route.q.y)
  const sex = route.q.c === 'E' ? 'E' : 'K'
  const name = (route.q.n || '').slice(0, 20)
  const valid = BANDS.some((b) => b.id === band)
  const p = route.q.p || ''
  const [conds, setConds] = useState([])
  const [other, setOther] = useState('')
  const [ring, fireRing] = useFlash(2600)
  const ringed = useRef(false)
  const s = { sex, band, conds: conds.filter((c) => c !== 'yok'), other: conds.includes('baska') ? other.trim() : '' }
  const answered = conds.length > 0
  const items = answered ? buildList(s) : []
  const base = { ...route.q }
  delete base.p
  delete base.d
  const go = (to) => setQuery('/a', to ? { ...base, p: to } : base)

  useEffect(() => {
    if ((p === 'liste' || p === 'son') && !answered) window.location.replace(`#/a?${new URLSearchParams({ ...base, p: 'soru' })}`)
  })

  if (!valid) {
    return (
      <Screen back={false}>
        <section className="sec">
          <h1>Bu bağlantı eksik</h1>
          <p className="meta">Gönderen kişiden yeniden göndermesini isteyin ya da kendiniz başlayın.</p>
          <a className="btn" style={{ marginTop: 12 }} href="#/">Kendim başlayayım</a>
        </section>
      </Screen>
    )
  }

  const introText = parentIntro(name)
  const firstOpen = () => {
    if (ringed.current) return
    ringed.current = true
    fireRing()
  }
  const call = <a className={`btn ${ring ? 'ring' : ''}`} href="tel:182"><Tel />182'yi arayın, randevu alın</a>

  let screen
  if (!p) {
    screen = (
      <Screen back={false} action={<button className="btn" onClick={() => go('soru')}>Başlayın</button>}>
        <div className="band hero">
          <div style={{ fontSize: 20, fontWeight: 600 }}>{name ? `${name} bunu size gönderdi` : 'Bu sayfa size gönderildi'}</div>
          <div className="t">Yaşınıza uygun kontroller</div>
        </div>
        <Cini />
        <section className="sec" style={{ border: 0 }}>
          <Voice title="Önce dinleyin" sub="Sesli anlatım" text={introText} audioText={PARENT_INTRO_AUDIO} className="spot" />
          <p style={{ fontSize: 21 }}>Bir soruya cevap verin, size uygun kontroller çıksın. Uygulama indirmeniz gerekmez.</p>
        </section>
        <Foot />
      </Screen>
    )
  } else if (p === 'soru') {
    const some = conds.length > 0 && !conds.includes('yok')
    screen = (
      <Screen progress="Tek soru" action={some ? <button className="btn" onClick={() => go('liste')}>Listemi göster</button> : null}>
        <section className="sec" style={{ border: 0 }}>
          <h1>Doktorunuzun takip ettiği bir sağlık durumunuz var mı?</h1>
          <p className="meta" style={{ marginBottom: 14 }}>İlaç, iğne ya da diyetle. Birden fazla seçebilirsiniz.</p>
          <Options options={[NONE, ...CONDS]} value={conds} multi onPick={(id) => {
            setConds(pickConds(conds, id))
            if (id === 'yok') after(() => go('liste'))
          }} />
          {conds.includes('baska') && <OtherField value={other} onChange={setOther} />}
        </section>
      </Screen>
    )
  } else if (p === 'liste' && answered) {
    screen = (
      <Screen action={<>{call}<button className="btn2" onClick={() => go('son')}>Sonra ne yapmalı? →</button></>}>
        <section className="sec" style={{ border: 0 }} aria-live="polite">
          <h1 style={{ fontSize: 29 }}>Size uygun {items.length} kontrol</h1>
          <p className="meta" style={{ marginBottom: 10 }}>Bir kontrole dokunun, okuyun ya da dinleyin.</p>
          <ItemList items={items} who="kendim" onFirstOpen={firstOpen} />
          {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 10 }}>{s.other ? `${s.other} için` : 'Diğer sağlık durumunuz için'} kontrolleri ve aşıları onu takip eden doktorunuza sorun. Doktor sayfasına da yazdık.</p>}
        </section>
      </Screen>
    )
  } else if (p === 'son' && answered) {
    screen = (
      <Screen>
        <section className="sec" style={{ border: 0, paddingBottom: 0 }}><h1>Şimdi ne yapmalı?</h1></section>
        <EndSection who="kendim" onDoctor={() => setQuery('/a', { ...route.q, d: 1 })} onSave={() => saveDoctorImage(doctorData(s, items))} numbered={1} />
        <ShareOn kind="arkadas" who="kendim" n={4} title="Kardeşinize, arkadaşınıza gönderin" sub="Onlar da kendi listelerine baksın. Bağlantı başlangıç sayfasını açar; sizin bilginiz gitmez." />
        <Foot />
      </Screen>
    )
  } else {
    return null
  }

  return (
    <>
      {screen}
      {route.q.d && answered && <DoctorPage s={s} items={items} onBack={() => window.history.back()} />}
    </>
  )
}

/* ---------- privacy (PD15) ---------- */

function PrivacyPage() {
  return (
    <>
      <header className="top"><button className="geri" onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.hash = '/'))}>‹ Geri</button><span className="wm">Canım</span></header>
      <section className="sec">
        <h1>Gizlilik</h1>
        <p>Canım'ı Doç. Dr. Cem Şimşek hazırladı.</p>
        <p>Cevaplarınız telefonunuzda kalır; hiçbir sunucuya gitmez. Çerez yok. Hesap yok.</p>
        <p>Annenize ya da babanıza gönderdiğiniz bağlantıda sağlık bilgisi yoktur. Yalnızca yaş aralığı, kadın/erkek ve yazarsanız ad vardır.</p>
        <p>Sitemizi barındıran GitHub, güvenlik için ziyaretçi IP adresini kaydeder.</p>
      </section>
      <Foot />
    </>
  )
}

/* ---------- for physicians ---------- */

function RulesPage() {
  return (
    <>
      <header className="top"><button className="geri" onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.hash = '/'))}>‹ Geri</button><span className="wm">Canım</span></header>
      <section className="sec">
        <h1>Hekimler için</h1>
        <p className="meta">Canım'ın önerdiği her kontrol aşağıdaki kurallardan gelir. Kural tarihi: {RULE_DATE}. {REVIEWED ? 'Hekim kontrolünden geçti.' : 'Hekim kontrolü bekliyor.'}</p>
      </section>
      <section className="sec" style={{ overflowX: 'auto' }}>
        <table className="rules">
          <thead><tr><th>Kontrol</th><th>Kime</th><th>Ne sıklıkla</th><th>Kaynak</th></tr></thead>
          <tbody>{RULE_TABLE.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
        </table>
      </section>
      <Foot />
    </>
  )
}

export default function App() {
  const route = useHash()
  // Answers live here so moving between screens (and to Gizlilik and back) keeps them.
  const [a, setA] = useState({ who: null, sexPick: null, band: null, conds: [], other: '' })
  const screenKey = `${route.path}?${route.q.p || ''}`
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screenKey])
  return (
    <div className="app">
      {!REVIEWED && <div className="draft">Deneme sürümü · hekim kontrolü bekliyor</div>}
      {route.path === '/a' ? <ParentPage route={route} />
        : route.path === '/kaynak' ? <RulesPage />
        : route.path === '/gizlilik' ? <PrivacyPage />
        : route.path.startsWith('/s/') ? <ChildFlow route={route} a={a} setA={setA} />
        : <IntroPage a={a} setA={setA} />}
    </div>
  )
}
