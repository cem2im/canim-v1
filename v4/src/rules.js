// Canım v4 — clinical rules.
// One source of truth: every item says who it is for, how often, and which
// programme or guideline it comes from. Reviewed by the physician (REVIEWED below).
// Physician decisions PD1–PD17 (guideline review, Ekim 2026) are noted where they apply.

export const RULE_DATE = 'Ekim 2026'
export const REVIEWED = true // Physician sign-off: 16 Oct 2026

export const BANDS = [
  { id: 18, label: '18–29' },
  { id: 30, label: '30–39' },
  { id: 40, label: '40–49' },
  { id: 50, label: '50–59' },
  { id: 60, label: '60–69' },
  { id: 70, label: '70 ve üzeri' },
]
export const bandLabel = (b) => BANDS.find((x) => x.id === b)?.label ?? ''

// PD10: Böbrek (KBH) and KOAH get their own buttons.
export const CONDS = [
  { id: 'tansiyon', label: 'Tansiyon' },
  { id: 'seker', label: 'Şeker' },
  { id: 'kolesterol', label: 'Kolesterol' },
  { id: 'kalp', label: 'Kalp' },
  { id: 'bobrek', label: 'Böbrek' },
  { id: 'koah', label: 'Akciğer (KOAH)', low: 'KOAH' },
  { id: 'baska', label: 'Diğer' },
]
export const condText = (conds) =>
  conds.map((c) => { const x = CONDS.find((y) => y.id === c); return x?.low ?? x?.label.toLocaleLowerCase('tr') }).join(', ')

const SRC = {
  ketem: 'T.C. Sağlık Bakanlığı HSGM, Ulusal Kanser Tarama Programı',
  hyp: 'Sağlık Bakanlığı HYP Tarama ve Takip Kılavuzu 2025',
  asi: 'Sağlık Bakanlığı Aşı Portalı; SGK SUT; EKMUD Erişkin Bağışıklama Rehberi 2024',
  dm: 'TEMD Diabetes Mellitus Kılavuzu 2026; ADA Standards of Care in Diabetes 2026',
  esc_ht: 'ESC 2024 Hipertansiyon Kılavuzu; TKD Hipertansiyon Uzlaşı Raporu',
  ht: 'Sağlık Bakanlığı Hipertansiyon Tarama ve İzlem Kılavuzu 2025; ESC 2024 Hipertansiyon Kılavuzu',
  goz_ayak: 'Sağlık Bakanlığı HYP Tarama ve Takip Kılavuzu 2025; TEMD Diabetes Mellitus Kılavuzu 2026; ADA Standards of Care in Diabetes 2026',
  kvr: 'Sağlık Bakanlığı Kardiyovasküler Risk Değerlendirmesi (HYP) 2025',
  lipid: 'ESC/EAS Dislipidemi Kılavuzu; TEMD Dislipidemi Kılavuzu 2021',
  kalp: 'Sağlık Bakanlığı KAH İzlem Kılavuzu 2019; ESC 2024 KKS; ESC 2021 Kalp Yetersizliği; ESC 2024 AF',
  kdigo: 'KDIGO 2024 KBH Kılavuzu; Sağlık Bakanlığı KBH İzlem Kılavuzu 2019',
  gold: 'GOLD 2025 KOAH Raporu',
  dxa: 'TEMD Osteoporoz Kılavuzu 2025 (65+ kadın, 70+ erkek); Sağlık Bakanlığı Yaşlı Değerlendirme Kılavuzu 2025',
  psa: 'EAU 2026 Prostat Kanseri Kılavuzu; USPSTF 2018 (55–69: C, 70+: D)',
  hep: 'CDC 2023 Hepatit B taraması (18 yaş üstü herkese bir kez); USPSTF 2020 Hepatit C taraması (18–79 yaş, bir kez)',
}

const has = (s, ...ids) => ids.some((i) => s.conds.includes(i))
// Conditions whose follow-up includes a yearly-or-more-often blood test.
const chronic = (s) => has(s, 'tansiyon', 'seker', 'kolesterol', 'kalp', 'bobrek')
// Risk groups for flu + pneumococcal vaccines (PD8; HSGM HT 2025 supports tansiyon).
const vaxRisk = (s) => s.band >= 70 || has(s, 'tansiyon', 'seker', 'kalp', 'bobrek', 'koah')

// s = { sex: 'K'|'E', band: 30..70, conds: [] }
export const RULES = [
  {
    id: 'kronik_kan',
    when: (s) => chronic(s),
    title: 'Kan ve idrar tahlili',
    // PD9: heart patients every 6 months. PD14: diabetes HbA1c 3–6 months, the rest yearly.
    freq: (s) => (has(s, 'seker') && has(s, 'bobrek') ? 'Şeker ortalaması (HbA1c) ve böbrek tahlili 3–6 ayda bir; diğerleri yılda bir'
      : has(s, 'seker') ? 'Şeker ortalaması (HbA1c) 3–6 ayda bir; diğerleri yılda bir'
      : has(s, 'bobrek') ? '3–6 ayda bir (doktorunuz belirler)'
      : has(s, 'kalp') ? '6 ayda bir' : 'Yılda bir'),
    tag: 'kılavuz + ulusal program (HYP)',
    doctor: (s) => {
      const p = []
      if (has(s, 'seker')) p.push('HbA1c (hedefteyse 6 ayda, değilse 3 ayda bir)')
      else p.push('Açlık glukozu veya HbA1c')
      p.push('lipid profili')
      if (has(s, 'seker', 'tansiyon', 'kalp', 'bobrek')) p.push('kreatinin/eGFR')
      if (has(s, 'tansiyon', 'kalp', 'bobrek')) p.push('Na/K')
      if (has(s, 'kalp')) p.push('tam kan sayımı', 'EKG')
      if (has(s, 'seker')) p.push('ALT/AST')
      return p.join(', ')
    },
    doctorSub: (s) => (has(s, 'seker', 'tansiyon', 'kalp', 'bobrek') ? 'İdrarda albümin/kreatinin oranı' : ''),
    ne: 'Şekerin son aylardaki ortalamasını, kolesterolü ve böbreklerin nasıl çalıştığını.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan ve bir kap idrar verilir.',
    sonra: 'Sonuca doktorunuz bakar. Gerekirse tahlil tekrarlanır, ilaç ayarlanır.',
    sor: 'Tahlil zamanım geldi mi?',
    src: (s) => [SRC.hyp, has(s, 'seker') && SRC.dm, has(s, 'tansiyon') && SRC.ht, has(s, 'kalp') && SRC.kalp, SRC.lipid, has(s, 'seker', 'tansiyon', 'bobrek') && SRC.kdigo].filter(Boolean).join('; '),
  },
  {
    // PD2 (modified by the physician): TEMD 2026, from 35, every 3 years, regardless of weight.
    id: 'tarama_seker',
    when: (s) => !chronic(s) && s.band === 30,
    title: 'Kan şekeri',
    freq: () => '35 yaşından sonra 3 yılda bir',
    tag: 'kılavuz',
    doctor: () => 'Açlık plazma glukozu (35 yaşından itibaren 3 yılda bir; TEMD 2026)',
    ne: 'Belirti vermeden başlayan şeker yüksekliğini.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan verilir.',
    sonra: 'Normalse 3 yıl sonra tekrarlanır. Sınırda çıkarsa her yıl.',
    sor: 'Şeker tahlilim yapılabilir mi?',
    src: () => 'TEMD Diabetes Mellitus Kılavuzu 2026; ADA Standards of Care in Diabetes 2026',
  },
  {
    // PD3: 2 yılda bir (HSGM KVR 2025); 65+ yearly left to the doctor.
    id: 'tarama_kan',
    when: (s) => !chronic(s) && s.band >= 40,
    title: 'Kan şekeri ve kolesterol',
    freq: () => '2 yılda bir',
    tag: 'ulusal tarama',
    doctor: () => 'Lipid profili (total-K, LDL, HDL, non-HDL, TG), AKŞ; SCORE2/SCORE2-OP KV risk (HYP)',
    doctorSub: () => 'Düşük-orta risk: 2 yılda bir; yüksek risk: 6–24 ay. Yalnız şeker taraması: 3 yılda bir (HYP)',
    ne: 'Belirti vermeden başlayan şeker ve kolesterol yüksekliğini.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan verilir.',
    sonra: 'Riskiniz düşükse 2 yıl sonra tekrarlanır. Sınırda çıkarsa her yıl.',
    sor: 'Şeker ve kolesterol tahlilim yapılabilir mi?',
    src: () => `${SRC.kvr}: 40 yaş ve üzeri, 2 yılda bir; ${SRC.hyp}; ${SRC.lipid}`,
  },
  {
    id: 'tansiyon',
    when: () => true,
    // PD12: people with high blood pressure get a follow-up item.
    title: (s) => (has(s, 'tansiyon') ? 'Tansiyon kontrolü' : 'Tansiyon ölçümü'),
    // PD1: under 40 without diabetes/heart/kidney disease every 3 years (HSGM HT 2025), cholesterol included.
    freq: (s) => {
      const home = has(s, 'tansiyon') ? '; evde düzenli ölçüm' : ''
      if (has(s, 'seker')) return 'Her doktor kontrolünde, en az 6 ayda bir' + home
      if (has(s, 'kalp', 'bobrek')) return 'Her doktor kontrolünde, en az yılda bir' + home
      if (has(s, 'tansiyon')) return 'Yılda bir kontrol; evde düzenli ölçüm'
      return s.band >= 40 ? 'Yılda bir' : '3 yılda bir'
    },
    tag: (s) => (has(s, 'tansiyon') ? 'ulusal program (HYP)' : 'ulusal tarama'),
    // Same branches as freq, so the doctor page never contradicts the list.
    doctor: (s) => {
      const home = has(s, 'tansiyon') ? '; ev KB ölçümü' : ''
      if (has(s, 'seker')) return 'Ofis KB her vizitte, en az 6 ayda bir (TEMD/ADA 2026)' + home
      if (has(s, 'kalp', 'bobrek')) return 'Ofis KB her vizitte, en az yılda bir' + home
      if (has(s, 'tansiyon')) return 'Ofis KB; hedefte yılda bir, yüksek KVR’de 6 ayda bir izlem (HSGM HT 2025); ev KB ölçümü'
      return 'Ofis kan basıncı ölçümü'
    },
    ne: (s) => (has(s, 'tansiyon') ? 'Tansiyonunuzun hedefte olup olmadığını.' : 'Belirti vermeyen yüksek tansiyonu.'),
    nasil: (s) => (has(s, 'tansiyon')
      ? 'Aile hekiminizde ölçülür. Evde de düzenli ölçün, değerleri yazıp kontrole götürün.'
      : 'Aile hekiminde ya da eczanede, oturarak, iki kez ölçülür.'),
    // CH05/CH06, PD16 approved (emergency warning): ESC 2024 I/C; HSGM HT 2025 s. 6.
    sonra: (s) => (has(s, 'tansiyon')
      ? 'Hedefte değilse ilacınız ayarlanır. 180/110 üstü ya da şikâyet varsa hemen doktora.'
      : 'Yüksek çıkarsa birkaç gün evde ölçmeniz istenir. 180/110 üstü ya da şikâyet varsa hemen doktora.'),
    sor: (s) => (has(s, 'tansiyon') ? 'Tansiyonum hedefte mi?' : 'Tansiyonumu ölçer misiniz?'),
    src: (s) => [SRC.ht, has(s, 'seker') && SRC.dm, has(s, 'bobrek') && SRC.kdigo].filter(Boolean).join('; '),
  },
  {
    // Owner decision (Oct 2026): one-time hepatitis B and C test for every adult.
    // Not in the Turkish national programme; from CDC 2023 (HBV, all adults once)
    // and USPSTF 2020 (HCV, 18–79 once).
    id: 'hepatit',
    when: () => true,
    title: 'Hepatit B ve C testi',
    freq: () => 'Hayatınızda bir kez (daha önce yapılmadıysa)',
    tag: 'kılavuz',
    doctor: () => 'HBsAg, anti-HBs, anti-HBc total ve anti-HCV; bir kez (CDC 2023; USPSTF 2020)',
    ne: 'Yıllarca belirti vermeden karaciğere zarar veren sarılık virüslerini (hepatit B ve C).',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan verilir.',
    sonra: 'Pozitifse tedavi ve takip için yönlendirilirsiniz. Hepatit C bugün ilaçla tamamen iyileşebiliyor.',
    sor: 'Hiç hepatit B ve C testim yapıldı mı?',
    src: () => SRC.hep,
  },
  {
    id: 'ggk',
    when: (s) => s.band >= 50,
    title: 'Evde bağırsak testi',
    // PD5: the programme ends at 70 when the last two tests were negative.
    freq: (s) => (s.band === 70 ? 'Son iki testiniz negatif değilse aile hekiminize sorun' : '2 yılda bir · ücretsiz'),
    tag: 'ulusal tarama',
    doctor: (s) => (s.band === 70
      ? 'Gaitada gizli kan testi (GGKT): program 70 yaşında biter'
      : 'Gaitada gizli kan testi (GGKT), 2 yılda bir; 10 yılda bir kolonoskopi önerisi'),
    doctorSub: (s) => (s.band === 70 ? '70 yaşında son iki test negatifse tarama biter; sonrası hekim kararı (HSGM)' : 'Pozitifse kolonoskopi; ayrıca 10 yılda bir kolonoskopi (HSGM)'),
    ne: 'Dışkıda gözle görülmeyen kanı.',
    nasil: (s) => (s.band === 70
      ? 'Devam gerekip gerekmediğine aile hekiminiz karar verir. Gerekirse kiti verir; evde yapıp geri götürürsünüz.'
      : 'Aile hekiminizden kiti ücretsiz alın, evde yapın, geri götürün.'),
    msg: (s) => (s.band === 70 ? 'ggk70' : 'ggk'),
    // CH01/CH02: minimizing sentence removed; final tone ("mutlaka", "Ertelemeyin") awaits PD16.
    sonra: 'Kan çıkarsa ince bir kamerayla bağırsağa bakılır (kolonoskopi).',
    sor: 'Dışkıda gizli kan (bağırsak) testi zamanım geldi mi?',
    src: () => `${SRC.ketem}: 50–70 yaş, 2 yılda bir; ${SRC.hyp}`,
  },
  {
    id: 'mamografi',
    when: (s) => s.sex === 'K' && s.band >= 40 && s.band <= 60,
    title: 'Mamografi ve meme muayenesi',
    // PD6: yearly clinical breast exam added.
    freq: () => 'Mamografi 2 yılda bir; meme muayenesi yılda bir · ücretsiz',
    tag: 'ulusal tarama',
    doctor: () => 'Mamografi (2 yılda bir) + klinik meme muayenesi (yılda bir)',
    ne: 'Elle fark edilmeyecek kadar küçük meme değişikliklerini.',
    nasil: "Aile hekiminize ya da doğrudan KETEM'e başvurun, ücretsizdir. Çekim birkaç dakika sürer.",
    sonra: 'Bir şey görülürse ek görüntüleme istenir. Çoğu zaman iyi huyludur.',
    sor: 'Mamografi ve meme muayenesi zamanım geldi mi?',
    src: () => `${SRC.ketem}: 40–69 yaş kadın, mamografi 2 yılda bir, klinik meme muayenesi yılda bir; ${SRC.hyp}`,
  },
  {
    id: 'hpv',
    when: (s) => s.sex === 'K' && s.band >= 30 && s.band <= 60,
    title: 'Rahim ağzı testi',
    freq: (s) => (s.band === 60 ? "5 yılda bir · 65 yaşına kadar" : '5 yılda bir'),
    tag: 'ulusal tarama',
    doctor: () => 'HPV-DNA testi (pozitifse sitoloji/kolposkopi)',
    ne: 'Rahim ağzı kanserine yol açan virüsü (HPV), yıllar önceden.',
    nasil: 'Aile hekiminizde ya da kanser tarama merkezinde (KETEM), birkaç dakikalık muayeneyle ücretsiz örnek alınır.',
    // CH03/CH04: "Randevuyu kaçırmayın" awaits PD16.
    sonra: 'Testte virüs çıkarsa kadın doğum doktoruna yönlendirilirsiniz.',
    sor: 'Rahim ağzı testim yapılabilir mi?',
    src: () => `${SRC.ketem}: 30–65 yaş kadın, 5 yılda bir`,
  },
  {
    // PD13: men 50–69 talk it over with the doctor; not shown at 70+ (USPSTF D).
    id: 'psa',
    when: (s) => s.sex === 'E' && s.band >= 50 && s.band <= 60,
    title: 'Prostat tahlili (PSA)',
    freq: () => 'Yapılıp yapılmayacağına doktorunuzla birlikte karar verin',
    tag: 'kılavuz',
    doctor: () => 'PSA ile erken tanı: bilgilendirilmiş ortak karar (EAU 2026; USPSTF 55–69 C)',
    ne: 'Prostatta erken dönemde başlayan değişiklikleri, kandaki PSA ile.',
    nasil: 'Aile hekiminizle yararını ve zararını konuşun. Karar verirseniz koldan biraz kan verilir.',
    sonra: 'Yüksek çıkarsa üroloji doktoruna yönlendirilirsiniz.',
    sor: 'PSA testi benim için uygun mu?',
    src: () => SRC.psa,
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
    sonra: 'Erken bulunursa görme kaybı ve ayak yarası önlenebilir.',
    sor: 'Göz dibi ve ayak muayenem için ne yapmalıyım?',
    src: () => SRC.goz_ayak,
  },
  {
    // PD14: diabetes extras as their own items.
    id: 'dis',
    group: 'seker_ek',
    when: (s) => has(s, 'seker'),
    title: 'Diş ve diş eti muayenesi',
    freq: () => 'Yılda bir',
    tag: 'ulusal program (HYP)',
    doctor: () => 'Diş hekimi muayenesi (periodontal değerlendirme), yılda bir',
    ne: 'Şekerle hızlanan diş eti hastalığını.',
    nasil: 'Diş hekimi ağzınıza ve diş etlerinize bakar.',
    sonra: 'Diş eti iltihabı tedavi edilirse şeker de daha kolay düzelir.',
    sor: 'Diş muayenem için sevk gerekir mi?',
    src: () => `${SRC.hyp}; ADA Standards of Care in Diabetes 2026`,
  },
  {
    id: 'karaciger',
    group: 'seker_ek',
    when: (s) => has(s, 'seker'),
    title: 'Karaciğer yağlanması hesabı',
    freq: () => 'Yılda bir',
    tag: 'ulusal program (HYP)',
    doctor: () => 'FIB-4 (yaş, AST, ALT, trombosit), yılda bir; ≥1,3 dahiliye, ≥2,67 gastroenteroloji (HYP)',
    ne: 'Karaciğerde sessiz ilerleyen yağlanma ve sertleşmeyi.',
    nasil: 'Ayrı bir iğne gerekmez. Kan tahlilindeki değerlerden hesaplanır.',
    sonra: 'Yüksek çıkarsa ileri tetkik için yönlendirilirsiniz.',
    sor: 'FIB-4 hesabım yapıldı mı?',
    src: () => `${SRC.hyp}; TEMD Diabetes Mellitus Kılavuzu 2026; EASL-EASD-EASO 2024`,
  },
  {
    id: 'b12',
    group: 'seker_ek',
    when: (s) => has(s, 'seker'),
    title: 'B12 vitamini tahlili',
    freq: () => 'Metformin kullanıyorsanız yılda bir',
    tag: 'kılavuz',
    doctor: () => 'Serum B12 (metformin kullanıyorsa yılda bir)',
    ne: 'Uzun süre metformin kullananlarda görülebilen B12 eksikliğini.',
    nasil: 'Aile hekiminiz ister. Koldan biraz kan verilir.',
    sonra: 'Düşükse B12 takviyesi verilir.',
    sor: 'Metformin kullanıyorum, B12 tahlilim gerekir mi?',
    src: () => SRC.dm,
  },
  {
    // PD7: men 70+ added (TEMD 2025 Sınıf B); repeat every 2 years without treatment (TEMD).
    id: 'kemik',
    when: (s) => (s.sex === 'K' && s.band >= 60) || (s.sex === 'E' && s.band >= 70),
    title: 'Kemik ölçümü',
    freq: (s) => (s.sex === 'K' && s.band === 60 ? '65 yaşından sonra' : 'Hiç yapılmadıysa bu yıl; sonra doktorunuz belirler'),
    tag: 'kılavuz',
    doctor: () => 'Kemik mineral yoğunluğu (santral DXA: lomber + kalça)',
    doctorSub: () => 'Tedavisizde 2 yılda bir (TEMD 2025)',
    ne: 'Kemik erimesini, kırık olmadan önce.',
    nasil: 'Hastanede, sırt üstü yatarak yapılan kısa bir çekim. Acısızdır, iğne yoktur.',
    sonra: 'Düşükse ilaç, D vitamini ve egzersiz önerilebilir.',
    sor: 'Kemik ölçümü yaptırmam gerekir mi?',
    src: () => SRC.dxa,
  },
  {
    // PD10: kidney disease.
    id: 'ilac_gozden',
    when: (s) => has(s, 'bobrek'),
    title: 'İlaçların gözden geçirilmesi',
    freq: () => 'Her kontrolde ve yeni ilaç başlarken',
    tag: 'kılavuz',
    doctor: () => 'İlaç gözden geçirme; GFR’ye göre doz; NSAİİ ve bitkisel ürünlerden kaçınma (KDIGO 2024)',
    ne: 'Böbreğe zarar verebilecek ilaçları ve yanlış dozları.',
    nasil: 'Kullandığınız bütün ilaçları, ağrı kesiciler ve bitkisel ürünler dahil, doktorunuza gösterin.',
    sonra: 'Gerekirse ilaç ya da doz değiştirilir.',
    sor: 'İlaçlarımın dozu böbreğime uygun mu?',
    src: () => 'KDIGO 2024 KBH Kılavuzu',
  },
  {
    // PD10: COPD.
    id: 'spirometri',
    when: (s) => has(s, 'koah'),
    title: 'Nefes testi',
    freq: () => 'Yılda bir',
    tag: 'kılavuz',
    doctor: () => 'Spirometri (bronkodilatör kesilmeden), yılda bir (GOLD 2025)',
    ne: 'Akciğer kapasitenizin nasıl değiştiğini.',
    nasil: 'Bir cihaza derin nefes alıp hızla üflersiniz. Çoğu zaman göğüs hastalıkları polikliniğinde yapılır.',
    sonra: 'Sonuca göre ilaçlarınız ayarlanır. İlaçlarınızı test günü bırakmayın.',
    sor: 'Nefes testim için sevk alabilir miyim?',
    src: () => SRC.gold,
  },
  {
    // PD8: vaccine matrix. Cholesterol alone is not a flu/pneumococcal risk group.
    id: 'asi',
    when: () => true,
    title: 'Aşılar',
    freq: (s) => (has(s, 'tansiyon') && !has(s, 'seker', 'kalp', 'bobrek', 'koah') && s.band < 70
      ? 'Grip her sonbahar; zatürre aşısı (doktorunuz planlar); tetanoz 10 yılda bir'
      : vaxRisk(s) ? 'Grip her sonbahar; zatürre bir kez; tetanoz 10 yılda bir'
      : s.band === 60 ? 'Tetanoz 10 yılda bir; 65’ten sonra grip ve zatürre' : 'Tetanoz, 10 yılda bir'),
    tag: 'ulusal program + SGK',
    doctor: (s) => (vaxRisk(s) ? 'İnfluenza (yıllık), pnömokok (PCV20 tek doz), Td (10 yılda bir)' : 'Td (10 yılda bir)'),
    ne: 'Yaşla ve kronik hastalıkla ağırlaşan enfeksiyonlara karşı korur.',
    nasil: (s) => (vaxRisk(s)
      ? 'Aile hekiminiz yapar. Tetanoz ve zatürre aşısı ücretsiz. Grip aşısı reçeteyle eczaneden alınır; sizin grubunuzda SGK karşılar.'
      : s.band === 60
        ? 'Aile hekiminiz yapar, tetanoz aşısı ücretsiz. 65 yaşından sonra grip ve zatürre aşısı da ücretsiz ya da SGK kapsamında.'
        : 'Aile hekiminiz yapar, tetanoz aşısı ücretsiz.'),
    sonra: (s) => (vaxRisk(s) ? 'Grip aşısı her sonbahar tekrarlanır.' : 'Tetanoz aşısı 10 yılda bir tekrarlanır.'),
    sor: 'Hangi aşılarım eksik?',
    src: () => SRC.asi,
  },
  {
    // PD8 + PD14: extra vaccines for people with diabetes (TEMD 2026), as their own items.
    id: 'hepb',
    group: 'seker_ek',
    when: (s) => has(s, 'seker') && s.band <= 50,
    title: 'Sarılık (hepatit B) aşısı',
    freq: () => 'Daha önce olmadıysanız bir kez (3 doz)',
    tag: 'kılavuz',
    doctor: () => 'HBV aşısı 0-1-6. ay, aşısız 19–59 yaş diyabetli (TEMD 2026 B)',
    ne: 'Kan yoluyla bulaşan sarılığa (hepatit B) karşı korur.',
    nasil: 'Aile hekiminiz yapar. Risk grubunda ücretsizdir.',
    sonra: 'Üç doz tamamlanınca uzun süre korur.',
    sor: 'Sarılık aşım var mı?',
    src: () => 'TEMD Diabetes Mellitus Kılavuzu 2026; Sağlık Bakanlığı Aşı Portalı; EKMUD 2026',
  },
  {
    id: 'zona',
    group: 'seker_ek',
    when: (s) => has(s, 'seker') && s.band >= 50,
    title: 'Zona aşısı',
    freq: () => 'Bir kez (2 doz) · ücretli',
    tag: 'kılavuz',
    doctor: () => 'Rekombinant zoster aşısı (RZV), 2–6 ay arayla 2 doz (TEMD 2026; EKMUD 2024)',
    ne: 'Zona ve sonrasında süren sinir ağrısına karşı korur.',
    nasil: 'Reçeteyle eczaneden alınır, aile hekiminizde yapılır. Devlet karşılamıyor.',
    sonra: 'İki doz tamamlanınca uzun süre korur.',
    sor: 'Zona aşısı benim için uygun mu?',
    src: () => 'TEMD Diabetes Mellitus Kılavuzu 2026; EKMUD Erişkin Bağışıklama Rehberi 2024',
  },
  {
    id: 'rsv',
    group: 'seker_ek',
    when: (s) => has(s, 'seker') && s.band >= 60,
    title: 'RSV aşısı',
    freq: () => 'Bir kez · ücretli',
    tag: 'kılavuz',
    doctor: () => 'RSV aşısı tek doz, 60+ diyabetli (TEMD 2026); EKMUD 2026: 75+ herkes, 50–74 yüksek risk',
    ne: 'Yaşlılarda ağır seyredebilen RSV solunum virüsüne karşı korur.',
    nasil: 'Reçeteyle eczaneden alınır, aile hekiminizde yapılır. Devlet karşılamıyor.',
    sonra: 'Tek doz yeterlidir.',
    sor: 'RSV aşısı benim için uygun mu?',
    src: () => 'TEMD Diabetes Mellitus Kılavuzu 2026; EKMUD Erişkin Bağışıklama Rehberi 2026 (taslak)',
  },
]

const val = (v, s) => (typeof v === 'function' ? v(s) : v)

export function buildList(s) {
  if (!s.sex || !s.band || !s.conds) return []
  // Grouped items go last, so the list and the doctor page number them the same way.
  const rules = RULES.filter((r) => r.when(s))
  return [...rules.filter((r) => !r.group), ...rules.filter((r) => r.group)].map((r) => ({
    id: r.id,
    title: val(r.title, s),
    msg: r.msg ? r.msg(s) : r.id,
    group: r.group ?? null,
    freq: r.freq(s),
    tag: val(r.tag, s),
    doctor: r.doctor(s),
    doctorSub: r.doctorSub ? r.doctorSub(s) : '',
    ne: val(r.ne, s),
    nasil: val(r.nasil, s),
    sonra: val(r.sonra, s),
    sor: val(r.sor, s),
    src: r.src(s),
  }))
}

// Table for the "Hekimler için" page.
export const RULE_TABLE = [
  ['Kan ve idrar tahlili', 'Tansiyon, şeker, kolesterol, kalp veya böbrek', 'Şekerde HbA1c 3–6 ay; kalpte 6 ayda bir; böbrekte 3–6 ay; diğerleri yılda bir', `${SRC.hyp}; ${SRC.dm}; ${SRC.ht}; ${SRC.kalp}; ${SRC.lipid}; ${SRC.kdigo}`],
  ['Kan şekeri', '30–39 yaş, takip edilen sağlık durumu yok', '35 yaşından itibaren 3 yılda bir', 'TEMD Diabetes Mellitus Kılavuzu 2026'],
  ['Kan şekeri ve kolesterol', '40 yaş ve üzeri, takip edilen sağlık durumu yok', '2 yılda bir (düşük-orta risk; HSGM KVR 2025); yüksek riskte 6–24 ay. Yalnız şeker taraması: 3 yılda bir (HYP)', `${SRC.kvr}; ${SRC.hyp}; ${SRC.lipid}`],
  ['Tansiyon ölçümü / kontrolü', 'Herkes', 'Tanısız: 40 yaş altı 3 yılda bir, 40+ yılda bir; diyabette her vizitte (≥6 ayda bir); kalp/böbrekte her vizitte. Hipertansiyonda yılda bir, yüksek KVR’de 6 ayda bir + ev KB', `${SRC.ht}; ${SRC.dm}; ${SRC.kdigo}`],
  ['Gaitada gizli kan (GGKT)', '50–70 yaş (dâhil)', "2 yılda bir; ayrıca 10 yılda bir kolonoskopi; 70'te son 2 test negatifse bırak", `${SRC.ketem}; ${SRC.hyp}`],
  ['Mamografi + klinik meme muayenesi', '40–69 yaş kadın (dâhil)', 'Mamografi 2 yılda bir; KMM yılda bir', `${SRC.ketem}; ${SRC.hyp}`],
  ['HPV / smear', '30–65 yaş kadın', '5 yılda bir', SRC.ketem],
  ['Hepatit B ve C testi', '18 yaş ve üzeri herkes (hekim kararı; ulusal programda yok)', 'Hayatta bir kez', SRC.hep],
  ['PSA (ortak karar)', '50–69 yaş erkek; 70+ rutin önerilmez', 'Doktorla konuşarak', SRC.psa],
  ['Göz dibi ve ayak muayenesi', 'Diyabet', 'Yılda bir', SRC.goz_ayak],
  ['Diş muayenesi, FIB-4, B12', 'Diyabet (B12: metformin)', 'Yılda bir', `${SRC.hyp}; ${SRC.dm}`],
  ['Kemik ölçümü (DXA)', '65+ kadın, 70+ erkek (risk varsa daha erken)', 'Tedavisizde 2 yılda bir (TEMD); USPSTF aralık belirtmez', `${SRC.dxa}; USPSTF 2025`],
  ['İlaç gözden geçirme', 'Kronik böbrek hastalığı', 'Her kontrolde', 'KDIGO 2024 KBH Kılavuzu'],
  ['Spirometri', 'KOAH', 'Yılda bir', SRC.gold],
  ['Aşılar', 'Td herkes; grip + pnömokok 65+ ve DM/kalp/akciğer/böbrek/HT; HBV aşısız 19–59 DM; RZV 50+ DM; RSV 60+ DM', 'Td 10 yılda bir; grip yıllık; pnömokok tek doz PCV20; RZV 2 doz; RSV tek doz', `${SRC.asi}; TEMD Diabetes Mellitus Kılavuzu 2026`],
]
