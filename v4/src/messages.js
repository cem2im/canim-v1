// "Annene sor" messages. Rules: no disease names, no blame ("neden yapmadın"),
// always end with an offer to help. Messages to fathers open as a favour.
// DRAFT: awaiting physician review.

const M = {
  kronik_kan: { q: 'en son ne zaman kan tahlili yaptırdın?', f: 'bu ay bir kan tahlili yaptırır mısın' },
  tarama_kan: { q: 'en son ne zaman şeker ve kolesterol tahlili yaptırdın?', f: 'bu yıl bir kan tahlili yaptırır mısın' },
  tansiyon: { q: 'en son ne zaman tansiyonunu ölçtürdün?', f: 'bir eczaneye uğrayıp tansiyonunu ölçtürür müsün' },
  ggk: { q: 'aile hekiminden evde yapılan bağırsak testini aldın mı? Ücretsizmiş.', f: 'aile hekiminden ücretsiz bağırsak testini alır mısın' },
  mamografi: { q: 'en son ne zaman mamografi oldun?', f: 'son 2 yılda mamografi olmadıysan bu yıl olur musun' },
  hpv: {
    q0: 'rahim ağzı testini (HPV) en son ne zaman yaptırdın? Aile hekiminde ücretsiz.',
    q: 'rahim ağzı testini en son ne zaman yaptırdın?',
    f: 'son 5 yılda rahim ağzı testi olmadıysan aile hekiminde yaptırır mısın',
  },
  goz_ayak: { q: 'en son ne zaman göz dibine damlayla baktırdın?', f: 'bu yıl göz doktoruna göz dibini, aile hekimine ayaklarını gösterir misin' },
  kemik: { q: 'hiç kemik ölçümü yaptırdın mı?', f: 'bir kemik ölçümü yaptırır mısın' },
  asi: { q: 'aşıların tam mı? En son ne zaman aşı oldun?', f: 'aile hekimine aşılarını sorar mısın' },
  tarama_seker: { q: 'en son ne zaman şeker tahlili yaptırdın?', f: 'bu yıl bir şeker tahlili yaptırır mısın' },
  psa: { q: 'prostat tahlilini (PSA) hiç doktorunla konuştun mu?', f: 'aile hekiminle prostat tahlilini (PSA) konuşur musun' },
  dis: { q: 'en son ne zaman diş hekimine gittin?', f: 'bu yıl diş etlerini diş hekimine gösterir misin' },
  karaciger: { q: 'kan tahlilinde karaciğer hesabına (FIB-4) baktılar mı?', f: 'aile hekimine karaciğer hesabını (FIB-4) sorar mısın' },
  b12: { q: 'metformin kullanıyorsan en son ne zaman B12 tahlili yaptırdın?', f: 'bir sonraki tahlilde B12’ye de baktırır mısın' },
  ilac_gozden: { q: 'kullandığın ilaçları en son ne zaman doktora gösterdin?', f: 'bütün ilaçlarını, ağrı kesiciler dahil, doktoruna gösterir misin' },
  spirometri: { q: 'en son ne zaman nefes testi yaptırdın?', f: 'bu yıl bir nefes testi yaptırır mısın' },
  hepb: { q: 'sarılık (hepatit B) aşın var mı?', f: 'aile hekimine sarılık aşını sorar mısın' },
  zona: { q: 'zona aşısını hiç doktorunla konuştun mu?', f: 'aile hekimine zona aşısını sorar mısın' },
  rsv: { q: 'RSV aşısını hiç doktorunla konuştun mu?', f: 'aile hekimine RSV aşısını sorar mısın' },
}

// Women-only checks: no message to fathers.
const K_ONLY = ['mamografi', 'hpv']

const OFFERS = ['İstersen randevuyu birlikte alalım.', 'Ben de seninle gelirim.', 'Sadece merak ettim.']

export function messagesFor(itemId, who) {
  const m = M[itemId]
  if (!m) return []
  if (who === 'baba' && K_ONLY.includes(itemId)) return []
  if (who === 'baba') {
    return [
      `Babacım, benim için ${m.f}? ${OFFERS[0]}`,
      `Babacım, ${m.q} ${OFFERS[1]}`,
      `Babacım, ${m.q} ${OFFERS[2]}`,
    ]
  }
  return [
    `Anneciğim, ${m.q0 ?? m.q} ${OFFERS[0]}`,
    `Anneciğim, ${m.f}? ${OFFERS[1]}`,
    `Anneciğim, ${m.q} ${OFFERS[2]}`,
  ]
}

export function giftMessage(who, url) {
  const h = who === 'baba' ? 'Babacım' : 'Anneciğim'
  return `${h}, senin için bir sağlık kontrol listesi hazırladım. Ben gönderdim, açabilirsin. Dokun, istersen sesli dinle:\n${url}`
}

export const waLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`
