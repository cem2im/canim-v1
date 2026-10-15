// "Annene sor" messages. Rules: no disease names, no blame ("neden yapmadın"),
// always end with an offer to help. Messages to fathers open as a favour.
// DRAFT: awaiting physician review.

const M = {
  kronik_kan: { q: 'en son ne zaman kan tahlili yaptırdın?', f: 'bu ay bir kan tahlili yaptırır mısın' },
  tarama_kan: { q: 'en son ne zaman kan tahlili yaptırdın?', f: 'bu yıl bir kan tahlili yaptırır mısın' },
  tansiyon: { q: 'en son ne zaman tansiyonunu ölçtürdün?', f: 'bir eczaneye uğrayıp tansiyonunu ölçtürür müsün' },
  ggk: { q: 'aile hekiminden evde yapılan bağırsak testini aldın mı? Ücretsizmiş.', f: 'aile hekiminden ücretsiz bağırsak testini alır mısın' },
  mamografi: { q: 'en son ne zaman mamografi oldun?', f: 'bu yıl bir mamografi olur musun' },
  hpv: { q: 'kadın doktoruna en son ne zaman gittin?', f: 'bu yıl bir kadın doktoruna görünür müsün' },
  goz_ayak: { q: 'en son ne zaman gözlerini baktırdın?', f: 'bu yıl gözlerini ve ayaklarını doktora gösterir misin' },
  kemik: { q: 'hiç kemik ölçümü yaptırdın mı?', f: 'bir kemik ölçümü yaptırır mısın' },
  asi: { q: 'aşıların tam mı? En son ne zaman aşı oldun?', f: 'aile hekimine aşılarını sorar mısın' },
}

const OFFERS = ['İstersen randevuyu birlikte alalım.', 'Ben de seninle gelirim.', 'Sadece merak ettim.']

export function messagesFor(itemId, who) {
  const m = M[itemId]
  if (!m) return []
  if (who === 'baba') {
    return [
      `Babacım, benim için ${m.f}? ${OFFERS[0]}`,
      `Babacım, ${m.q} ${OFFERS[1]}`,
      `Babacım, ${m.q} ${OFFERS[2]}`,
    ]
  }
  return [
    `Anneciğim, ${m.q} ${OFFERS[0]}`,
    `Anneciğim, ${m.f}? ${OFFERS[1]}`,
    `Anneciğim, ${m.q} ${OFFERS[2]}`,
  ]
}

export function giftMessage(who, url) {
  const h = who === 'baba' ? 'Babacım' : 'Anneciğim'
  return `${h}, senin için yaşına uygun sağlık kontrollerini hazırladım. Dokun, istersen sesli dinle:\n${url}`
}

export const waLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`
