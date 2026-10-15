// Canım v4 — clinical rules.
// One source of truth: every item says who it is for, how often, and which
// programme or guideline it comes from. DRAFT: awaiting physician review.

export const RULE_DATE = 'Ekim 2026'
export const REVIEWED = false

export const BANDS = [
  { id: 30, label: '30–39' },
  { id: 40, label: '40–49' },
  { id: 50, label: '50–59' },
  { id: 60, label: '60–69' },
  { id: 70, label: '70 ve üzeri' },
]
export const bandLabel = (b) => BANDS.find((x) => x.id === b)?.label ?? ''

export const CONDS = [
  { id: 'tansiyon', label: 'Tansiyon' },
  { id: 'seker', label: 'Şeker' },
  { id: 'kolesterol', label: 'Kolesterol' },
  { id: 'kalp', label: 'Kalp' },
  { id: 'baska', label: 'Başka' },
]
export const condText = (conds) =>
  conds.map((c) => CONDS.find((x) => x.id === c)?.label.toLocaleLowerCase('tr')).join(', ')

const SRC = {
  ketem: 'T.C. Sağlık Bakanlığı, Ulusal Kanser Tarama Programları (KETEM)',
  asi: 'T.C. Sağlık Bakanlığı, Erişkin Aşılama; TEMD/EKMUD erişkin aşı rehberi',
  ada: 'ADA Standards of Care in Diabetes 2025; TEMD Diabetes Mellitus Kılavuzu',
  esc_ht: 'ESC 2024 Hipertansiyon Kılavuzu; TKD Hipertansiyon Uzlaşı Raporu',
  lipid: 'ESC/EAS Dislipidemi Kılavuzu; TKD Lipid Kılavuzu',
  kdigo: 'KDIGO 2024 KBH Kılavuzu',
  dxa: 'USPSTF 2025 Osteoporoz Taraması; TEMD Osteoporoz Kılavuzu',
}

const has = (s, ...ids) => ids.some((i) => s.conds.includes(i))
const chronic = (s) => has(s, 'tansiyon', 'seker', 'kolesterol', 'kalp')

// s = { sex: 'K'|'E', band: 30..70, conds: [] }
export const RULES = [
  {
    id: 'kronik_kan',
    when: (s) => chronic(s),
    title: 'Kan ve idrar tahlili',
    freq: (s) => (has(s, 'seker') ? '3–6 ayda bir' : 'Yılda bir'),
    tag: 'kılavuz',
    doctor: (s) => {
      const p = []
      if (has(s, 'seker')) p.push('HbA1c')
      else p.push('Açlık glukozu veya HbA1c')
      p.push('lipid profili')
      if (has(s, 'seker', 'tansiyon')) p.push('kreatinin/eGFR')
      if (has(s, 'tansiyon')) p.push('Na/K')
      return p.join(', ')
    },
    doctorSub: (s) => (has(s, 'seker', 'tansiyon') ? 'İdrarda albümin/kreatinin oranı' : ''),
    ne: 'Şekerin son aylardaki ortalamasını, kolesterolü ve böbreklerin nasıl çalıştığını.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan ve bir kap idrar verilir.',
    sonra: 'Sonuçlara ilacınızı yazan doktor bakar. Gerekirse ilaç ayarlanır.',
    sor: 'Tahlil zamanım geldi mi?',
    src: (s) => [has(s, 'seker') && SRC.ada, has(s, 'tansiyon') && SRC.esc_ht, SRC.lipid, has(s, 'seker', 'tansiyon') && SRC.kdigo].filter(Boolean).join('; '),
  },
  {
    id: 'tarama_kan',
    when: (s) => !chronic(s) && s.band >= 40,
    title: 'Kan şekeri ve kolesterol',
    freq: () => '3 yılda bir',
    tag: 'ulusal tarama',
    doctor: () => 'Açlık glukozu veya HbA1c, lipid profili',
    ne: 'Belirti vermeden başlayan şeker ve kolesterol yüksekliğini.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan verilir.',
    sonra: 'Normalse 3 yıl sonra tekrarlanır.',
    sor: 'Şeker ve kolesterol tahlilim yapılabilir mi?',
    src: () => `${SRC.ada}; ${SRC.lipid}`,
  },
  {
    id: 'tansiyon',
    when: (s) => !has(s, 'tansiyon'),
    title: 'Tansiyon ölçümü',
    freq: (s) => (s.band >= 40 ? 'Yılda bir' : '3 yılda bir'),
    tag: 'kılavuz',
    doctor: () => 'Ofis kan basıncı ölçümü',
    ne: 'Belirti vermeyen yüksek tansiyonu.',
    nasil: 'Aile hekiminde ya da eczanede, oturarak, iki kez ölçülür.',
    // CH05/CH06: the "180/110 üstü ya da şikâyet varsa hemen doktora" sentence awaits PD16.
    sonra: 'Yüksek çıkarsa birkaç gün evde ölçmeniz istenir.',
    sor: 'Tansiyonumu ölçer misiniz?',
    src: () => SRC.esc_ht,
  },
  {
    id: 'ggk',
    when: (s) => s.band === 50 || s.band === 60,
    title: 'Evde bağırsak testi',
    freq: () => '2 yılda bir · ücretsiz',
    tag: 'ulusal tarama',
    doctor: () => 'Gaitada gizli kan (GGK/FIT)',
    ne: 'Dışkıda gözle görülmeyen kanı.',
    nasil: 'Aile hekiminizden kiti ücretsiz alın, evde yapın, geri götürün.',
    // CH01/CH02: minimizing sentence removed; final tone ("mutlaka", "Ertelemeyin") awaits PD5/PD16.
    sonra: 'Kan çıkarsa ince bir kamerayla bağırsağa bakılır (kolonoskopi).',
    sor: 'Gaitada gizli kan testi zamanım geldi mi?',
    src: () => `${SRC.ketem}: 50–70 yaş, 2 yılda bir`,
  },
  {
    id: 'mamografi',
    when: (s) => s.sex === 'K' && s.band >= 40 && s.band <= 60,
    title: 'Mamografi',
    freq: () => "2 yılda bir · KETEM'de ücretsiz",
    tag: 'ulusal tarama',
    doctor: () => 'Mamografi',
    ne: 'Elle fark edilmeyecek kadar küçük meme değişikliklerini.',
    nasil: "Aile hekiminiz sizi KETEM'e yönlendirir. Çekim birkaç dakika sürer.",
    sonra: 'Bir şey görülürse ek görüntüleme istenir. Çoğu zaman iyi huyludur.',
    sor: 'Mamografi zamanım geldi mi?',
    src: () => `${SRC.ketem}: 40–69 yaş kadın, 2 yılda bir`,
  },
  {
    id: 'hpv',
    when: (s) => s.sex === 'K' && s.band >= 30 && s.band <= 60,
    title: 'Rahim ağzı testi',
    freq: (s) => (s.band === 60 ? "5 yılda bir · 65 yaşına kadar" : '5 yılda bir'),
    tag: 'ulusal tarama',
    doctor: () => 'HPV testi (± smear)',
    ne: 'Rahim ağzı kanserine yol açan virüsü (HPV), yıllar önceden.',
    nasil: 'Aile hekiminizde ya da kanser tarama merkezinde (KETEM), birkaç dakikalık muayeneyle ücretsiz örnek alınır.',
    // CH03/CH04: "Randevuyu kaçırmayın" awaits PD16.
    sonra: 'Testte virüs çıkarsa kadın doğum doktoruna yönlendirilirsiniz.',
    sor: 'Rahim ağzı testim yapılabilir mi?',
    src: () => `${SRC.ketem}: 30–65 yaş kadın, 5 yılda bir`,
  },
  {
    id: 'goz_ayak',
    when: (s) => has(s, 'seker'),
    title: 'Göz ve ayak muayenesi',
    freq: () => 'Yılda bir',
    tag: 'kılavuz',
    doctor: () => 'Göz dibi muayenesi, ayak muayenesi',
    doctorSub: () => 'Monofilaman, nabızlar',
    ne: 'Göz dibinde ve ayaklarda sessiz başlayan hasarı.',
    nasil: 'Göz doktoru damla damlatıp göz dibine bakar. Ayaklara aile hekiminiz bakar.',
    sonra: 'Erken bulunursa tedavisi kolaydır.',
    sor: 'Göz dibi ve ayak muayenem için ne yapmalıyım?',
    src: () => SRC.ada,
  },
  {
    id: 'kemik',
    when: (s) => s.sex === 'K' && s.band >= 60,
    title: 'Kemik ölçümü',
    freq: (s) => (s.band === 60 ? '65 yaşından sonra' : 'Doktorunuza göre'),
    tag: 'kılavuz',
    doctor: () => 'Kemik mineral yoğunluğu (DXA)',
    ne: 'Kemik erimesini, kırık olmadan önce.',
    nasil: 'Sırt üstü yatarak birkaç dakikalık bir çekim. Acısızdır.',
    sonra: 'Düşükse ilaç, D vitamini ve egzersiz önerilebilir.',
    sor: 'Kemik ölçümü yaptırmam gerekir mi?',
    src: () => `${SRC.dxa}: 65 yaş ve üzeri kadın`,
  },
  {
    id: 'asi',
    when: () => true,
    title: 'Aşılar',
    freq: (s) => (s.band >= 70 || chronic(s) ? 'Grip, zatürre, tetanoz' : s.band === 60 ? 'Tetanoz; 65’ten sonra grip ve zatürre' : 'Tetanoz, 10 yılda bir'),
    tag: 'ulusal aşı programı',
    doctor: (s) => (s.band >= 70 || chronic(s) ? 'İnfluenza (yıllık), pnömokok, Td' : 'Td (10 yılda bir)'),
    ne: 'Yaşla ve kronik hastalıkla ağırlaşan enfeksiyonlara karşı korur.',
    nasil: 'Aile hekiminizde yapılır. Risk grubundakiler için ücretsizdir.',
    sonra: 'Grip aşısı her sonbahar tekrarlanır.',
    sor: 'Hangi aşılarım eksik?',
    src: () => SRC.asi,
  },
]

export function buildList(s) {
  if (!s.sex || !s.band || !s.conds) return []
  return RULES.filter((r) => r.when(s)).map((r) => ({
    id: r.id,
    title: r.title,
    freq: r.freq(s),
    tag: r.tag,
    doctor: r.doctor(s),
    doctorSub: r.doctorSub ? r.doctorSub(s) : '',
    ne: r.ne,
    nasil: r.nasil,
    sonra: r.sonra,
    sor: r.sor,
    src: r.src(s),
  }))
}

// Table for the "Hekimler için" page.
export const RULE_TABLE = [
  ['Kan ve idrar tahlili', 'Tansiyon, şeker, kolesterol veya kalp', 'Şekerde HbA1c 3–6 ay; diğerleri yılda bir', `${SRC.ada}; ${SRC.esc_ht}; ${SRC.lipid}; ${SRC.kdigo}`],
  ['Kan şekeri ve kolesterol', '40 yaş ve üzeri, kronik hastalık yok', '3 yılda bir', `${SRC.ada}; ${SRC.lipid}`],
  ['Tansiyon ölçümü', 'Tansiyon hastası olmayan herkes', '40 yaş üstü yılda bir, altı 3 yılda bir', SRC.esc_ht],
  ['Gaitada gizli kan', '50–70 yaş', '2 yılda bir', SRC.ketem],
  ['Mamografi', '40–69 yaş kadın', '2 yılda bir', SRC.ketem],
  ['HPV / smear', '30–65 yaş kadın', '5 yılda bir', SRC.ketem],
  ['Göz dibi ve ayak muayenesi', 'Diyabet', 'Yılda bir', SRC.ada],
  ['Kemik ölçümü (DXA)', '65 yaş ve üzeri kadın', 'Bir kez; sonrası hekime göre', SRC.dxa],
  ['Aşılar', 'Herkes; grip ve pnömokok 65+ ve kronik hastalıkta', 'Td 10 yılda bir; grip yıllık', SRC.asi],
]
