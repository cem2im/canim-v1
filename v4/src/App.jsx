import { useEffect, useMemo, useRef, useState } from 'react'
import { BANDS, CONDS, RULE_DATE, RULE_TABLE, REVIEWED, bandLabel, buildList, condText } from './rules'
import { giftMessage, messagesFor, waLink } from './messages'
import { canSpeak, speak, stopSpeak } from './speak'
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

function Chips({ options, value, multi, onPick }) {
  const on = (id) => (multi ? value.includes(id) : value === id)
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o.id} className="chip" aria-pressed={on(o.id)} onClick={() => onPick(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Voice({ title, sub, text, small, className = '' }) {
  const [on, setOn] = useState(false)
  useEffect(() => () => on && stopSpeak(), [on])
  if (!canSpeak) return null
  const toggle = () => {
    if (on) {
      stopSpeak()
      setOn(false)
    } else {
      setOn(true)
      speak(text, () => setOn(false))
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

function ItemList({ items, who, onAsk, onFirstOpen }) {
  const [open, setOpen] = useState(null)
  const toggle = (id) => {
    setOpen((o) => (o === id ? null : id))
    onFirstOpen?.()
  }
  const canAsk = who === 'anne' || who === 'baba'
  return (
    <div className="sheet">
      {items.map((it, i) => {
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
                <Voice small title="Sesli dinleyin" sub="Bu kontrol" text={`${it.title}. Ne arar? ${it.ne} Nasıl yapılır? ${it.nasil} Sonra ne olur? ${it.sonra}`} />
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
      })}
      <p className="source">Devletin tarama programına ve doktor önerilerine dayanır ({RULE_DATE}). Bakanlık sitesi değildir.</p>
    </div>
  )
}

function AskSheet({ item, who, onClose }) {
  const alts = messagesFor(item.id, who)
  const [pick, setPick] = useState(0)
  const [text, setText] = useState(alts[0])
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
      <a className="btn" style={{ marginTop: 12 }} href={waLink(text)} target="_blank" rel="noopener noreferrer">WhatsApp'ta gönder</a>
      <button className="btn2" onClick={onClose}>Kapat</button>
      <p className="note">Mesaj sizin adınıza gider. Canım hiçbir şey kaydetmez.</p>
    </Sheet>
  )
}

function GiftSheet({ who, s, onClose }) {
  const [name, setName] = useState('')
  const url = useMemo(() => {
    const q = new URLSearchParams({ y: s.band, c: s.sex, k: who })
    if (name.trim()) q.set('n', name.trim().slice(0, 20))
    return `${window.location.origin}${window.location.pathname}#/a?${q}`
  }, [name, s, who])
  const text = giftMessage(who, url)
  return (
    <Sheet onClose={onClose} label="Gönder">
      <h2>{who === 'baba' ? 'Babanıza gönderin' : 'Annenize gönderin'}</h2>
      <p className="meta" style={{ marginBottom: 10 }}>Açtığı sayfada kendi listesini görür, sesli dinler. Uygulama indirmesi gerekmez.</p>
      <label className="lbl" htmlFor="ad">Adınız (isteğe bağlı)</label>
      <input id="ad" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örneğin: Elif" autoComplete="given-name" />
      <p className="meta" style={{ margin: '8px 0 12px' }}>Sayfada “{name.trim() || 'Biri'} bunu size gönderdi” yazar.</p>
      <a className="btn" href={waLink(text)} target="_blank" rel="noopener noreferrer">WhatsApp'ta gönder</a>
      <button className="btn2" onClick={onClose}>Kapat</button>
      <p className="note">Bağlantıda hastalık bilgisi yoktur; yalnızca yaş aralığı.</p>
    </Sheet>
  )
}

/* ---------- end of page: call, show, keep ---------- */

function EndSection({ who, onDoctor, onSave }) {
  const forParent = who === 'anne' || who === 'baba'
  const title = forParent ? 'Randevuyu birlikte alın' : 'Bu ay aile hekiminize gidin'
  return (
    <>
      <section className="sec">
        <h2>{title}</h2>
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
        <h2>Doktorunuza gösterin</h2>
        <p className="meta">Doktorun okuyacağı büyük yazılı sayfa açılır.</p>
        <button className="btn2" onClick={onDoctor}>Doktora gösterilecek sayfa</button>
      </section>
      <section className="sec">
        <h2>Kaybetmeyin</h2>
        <button className="btn2" onClick={onSave}>Resim olarak kaydet</button>
      </section>
    </>
  )
}

function Foot() {
  return (
    <footer className="foot">
      <p>Canım bilgilendirme amaçlıdır, teşhis koymaz. Karar hekiminizindir.</p>
      <p style={{ marginTop: 6 }}>Hiçbir bilgi kaydedilmez, hiçbir yere gönderilmez. <a href="#/kaynak">Hekimler için: kurallar ve kaynaklar</a></p>
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
          {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 8 }}>Ayrıca başka bir kronik hastalığı var; onun kontrolleri ayrıca değerlendirilmeli.</p>}
          <p className="meta" style={{ marginTop: 12, fontSize: 16 }}>{footer}</p>
        </div>
      </div>
      <div className="sticky" style={{ maxWidth: 640, margin: '0 auto' }}>
        <button className="btn" onClick={() => saveDoctorImage({ meta, items, footer })}>Resim olarak kaydet</button>
      </div>
    </div>
  )
}

/* ---------- page 1: the person who prepares the list ---------- */

const WHO = [
  { id: 'kendim', label: 'Kendim' },
  { id: 'anne', label: 'Annem' },
  { id: 'baba', label: 'Babam' },
  { id: 'baska', label: 'Başka biri' },
]
const SEX = [{ id: 'K', label: 'Kadın' }, { id: 'E', label: 'Erkek' }]
const NONE = { id: 'yok', label: 'Hiçbiri yok' }

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

function ChildPage({ route }) {
  const [who, setWho] = useState(null)
  const [sexPick, setSexPick] = useState(null)
  const [band, setBand] = useState(null)
  const [conds, setConds] = useState([])
  const [ask, setAsk] = useState(null)
  const [gift, setGift] = useState(false)
  const [listLit, flashList] = useFlash()
  const listRef = useRef(null)

  const sex = who === 'anne' ? 'K' : who === 'baba' ? 'E' : sexPick
  const needSex = who === 'kendim' || who === 'baska'
  const s = { sex, band, conds: conds.filter((c) => c !== 'yok') }
  const done = who && sex && band && conds.length > 0
  const items = done ? buildList(s) : []
  const bands = who === 'anne' || who === 'baba' ? BANDS.filter((b) => b.id >= 40) : BANDS

  const step = !who ? 'who' : !sex ? 'sex' : !band ? 'band' : !conds.length ? 'cond' : 'list'
  const cls = (q, answered) => (step === q ? 'spot' : answered ? '' : 'dim')

  const showList = () => {
    flashList()
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const onCond = (id) => {
    const next = pickConds(conds, id)
    setConds(next)
    if (id === 'yok') showList()
  }

  const ageQ = { anne: 'Annenizin yaşı?', baba: 'Babanızın yaşı?', kendim: 'Yaşınız?', baska: 'Kaç yaşında?' }[who] || 'Yaşı?'
  const condQ = who === 'kendim' ? 'Her gün ilaç içtiğiniz bir hastalık?' : 'Her gün ilaç içtiği bir hastalık?'
  const listTitle = { anne: 'Annenizin', baba: 'Babanızın', kendim: 'Sizin', baska: 'Onun' }[who]

  const openDoctor = () => setQuery('/', { d: 1 })
  const closeDoctor = () => window.history.back()

  return (
    <>
      <header className="top"><span className="wm">Canım</span><span className="meta" style={{ fontSize: 18 }}>Üyelik yok · ücretsiz</span></header>
      <section className="sec" style={{ paddingTop: 4 }}>
        <h1>Hangi kontroller gerekli?</h1>
        <p className="meta">Üç soruya dokunun, liste hemen aşağıda çıksın.</p>
      </section>
      <section className={`sec ${cls('who', who)}`}>
        <div className="q">Kimin için?</div>
        <Chips options={WHO} value={who} onPick={(id) => { setWho(id); setBand(null) }} />
      </section>
      {needSex && (
        <section className={`sec ${cls('sex', sexPick)}`}>
          <div className="q">Kadın mı, erkek mi?</div>
          <Chips options={SEX} value={sexPick} onPick={setSexPick} />
        </section>
      )}
      <section className={`sec ${cls('band', band)}`}>
        <div className="q">{ageQ}</div>
        <Chips options={bands} value={band} onPick={setBand} />
      </section>
      <section className={`sec ${cls('cond', conds.length)}`}>
        <div className="q">{condQ}</div>
        <Chips options={[NONE, ...CONDS]} value={conds} multi onPick={onCond} />
        {conds.length > 0 && !conds.includes('yok') && (
          <button className="btn" style={{ marginTop: 14 }} onClick={showList}>Listeyi göster ↓</button>
        )}
      </section>

      {!done && <section className="sec dim" style={{ border: 0 }}><p className="meta" style={{ textAlign: 'center' }}>↓ Liste burada belirecek</p></section>}

      {done && (
        <>
          <section ref={listRef} className={`sec ${listLit ? 'spot' : ''}`} style={{ border: 0, scrollMarginTop: 8 }} aria-live="polite">
            <h1 style={{ fontSize: 29 }}>{listTitle} {items.length} kontrolü</h1>
            <p className="meta" style={{ marginBottom: 10 }}>
              {who === 'anne' || who === 'baba' ? `Her kontrolü ${who === 'baba' ? 'babanıza' : 'annenize'} sorabilirsiniz. Hazır bir mesaj yazdık.` : 'Bir kontrole dokunun, ne olduğunu okuyun.'}
            </p>
            <ItemList items={items} who={who} onAsk={setAsk} />
            {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 10 }}>Diğer hastalığın kontrollerini onu takip eden doktor belirler.</p>}
          </section>
          {(who === 'anne' || who === 'baba') && (
            <section className="sec">
              <button className="btn" onClick={() => setGift(true)}>{who === 'baba' ? 'Babanıza gönderin' : 'Annenize gönderin'}</button>
            </section>
          )}
          <EndSection who={who} onDoctor={openDoctor} onSave={() => saveDoctorImage(doctorData(s, items))} />
        </>
      )}
      <Foot />
      {ask && <AskSheet item={ask} who={who} onClose={() => setAsk(null)} />}
      {gift && <GiftSheet who={who} s={s} onClose={() => setGift(false)} />}
      {route.q.d && done && <DoctorPage s={s} items={items} onBack={closeDoctor} />}
    </>
  )
}

function doctorData(s, items) {
  return {
    meta: `${bandLabel(s.band)} yaş · ${s.sex === 'K' ? 'kadın' : 'erkek'}${s.conds.length ? ` · ${condText(s.conds)} (kendisi söyledi)` : ''} · ${today()}`,
    items,
    footer: `Bilgilendirme amaçlıdır; karar hekimindir. Kurallar: Sağlık Bakanlığı tarama programları ve güncel kılavuzlar, ${RULE_DATE}.`,
  }
}

/* ---------- page 2: the parent who opens the link ---------- */

function ParentPage({ route }) {
  const band = Number(route.q.y)
  const sex = route.q.c === 'E' ? 'E' : 'K'
  const name = (route.q.n || '').slice(0, 20)
  const valid = BANDS.some((b) => b.id === band)
  const [conds, setConds] = useState([])
  const [intro, setIntro] = useState(canSpeak)
  const [ring, fireRing] = useFlash(2600)
  const ringed = useRef(false)
  const s = { sex, band, conds: conds.filter((c) => c !== 'yok') }
  const answered = conds.length > 0
  const items = answered ? buildList(s) : []

  useEffect(() => {
    if (!intro) return
    const lift = () => setIntro(false)
    const t = setTimeout(() => window.addEventListener('pointerdown', lift, { once: true }), 50)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', lift)
    }
  }, [intro])

  if (!valid) {
    return (
      <section className="sec">
        <h1>Bu bağlantı eksik</h1>
        <p className="meta">Gönderen kişiden yeniden göndermesini isteyin ya da kendiniz başlayın.</p>
        <a className="btn" style={{ marginTop: 12 }} href="#/">Kendim başlayayım</a>
      </section>
    )
  }

  const introText = `Merhaba. Bu sayfayı ${name || 'bir yakınınız'} sizin için hazırladı. Önce bir soruya cevap verin. Sonra size uygun kontroller çıkacak. Her birine dokunun, okuyun ya da dinleyin. En altta randevu hattı 182'yi aramak için bir düğme var. Karar her zaman doktorunuzundur.`
  const openDoctor = () => setQuery('/a', { ...route.q, d: 1 })
  const firstOpen = () => {
    if (ringed.current) return
    ringed.current = true
    fireRing()
  }

  return (
    <>
      <div className="band">
        <div style={{ fontSize: 20, fontWeight: 600 }}>{name ? `${name} bunu size gönderdi` : 'Bu sayfa size gönderildi'}</div>
        <div className="t">Yaşınıza uygun kontroller</div>
      </div>
      <Cini />
      <section className="sec" style={{ border: 0, paddingTop: 12 }}>
        <Voice title="Önce dinleyin" sub="Sesli anlatım" text={introText} className={intro ? 'spot' : ''} />
        <div className={intro ? 'dim' : !answered ? 'spot' : ''} style={{ padding: '12px 12px 14px', margin: '0 -12px', borderRadius: 4 }}>
          <div className="q">Her gün ilaç içtiğiniz bir hastalık var mı?</div>
          <Chips options={[NONE, ...CONDS]} value={conds} multi onPick={(id) => setConds(pickConds(conds, id))} />
        </div>
      </section>
      {answered ? (
        <section className={`sec ${intro ? 'dim' : ''}`} style={{ border: 0, paddingTop: 0 }} aria-live="polite">
          <h2>Size uygun {items.length} kontrol</h2>
          <ItemList items={items} who="kendim" onFirstOpen={firstOpen} />
          {s.conds.includes('baska') && <p className="meta" style={{ marginTop: 10 }}>Diğer hastalığınızın kontrollerini onu takip eden doktorunuz belirler.</p>}
        </section>
      ) : (
        <section className="sec dim" style={{ border: 0 }}><p className="meta" style={{ textAlign: 'center' }}>↓ Liste burada belirecek</p></section>
      )}
      {answered && <EndSection who="kendim" onDoctor={openDoctor} onSave={() => saveDoctorImage(doctorData(s, items))} />}
      <Foot />
      <div className="sticky">
        <a className={`btn ${ring ? 'ring' : ''}`} href="tel:182"><Tel />182'yi arayın, randevu alın</a>
      </div>
      {route.q.d && answered && <DoctorPage s={s} items={items} onBack={() => window.history.back()} />}
    </>
  )
}

/* ---------- for physicians ---------- */

function RulesPage() {
  return (
    <>
      <header className="top"><a className="geri" href="#/">‹ Geri</a><span className="wm">Canım</span></header>
      <section className="sec">
        <h1>Hekimler için</h1>
        <p className="meta">Canım'ın önerdiği her kontrol aşağıdaki kurallardan gelir. Kural tarihi: {RULE_DATE}. {REVIEWED ? '' : 'Hekim kontrolü bekliyor.'}</p>
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
  return (
    <div className="app">
      {!REVIEWED && <div className="draft">Deneme sürümü · hekim kontrolü bekliyor</div>}
      {route.path === '/a' ? <ParentPage route={route} /> : route.path === '/kaynak' ? <RulesPage /> : <ChildPage route={route} />}
    </div>
  )
}
