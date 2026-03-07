// ─── SCREENING DEFINITIONS ───────────────────────────────────────────────────
// Each screening has: id, trName, enName, explanation, frequencyMonths,
//   ageMin, ageMax, sex (M/F/both), weight (1=routine, 2=organ, 3=cancer),
//   labPackage (null or array of lab test ids), doctor (specialty)
//   sources: [{ name, url, year }] — verified guideline links

export const SCREENINGS = {

  // ── LAB PACKAGES ────────────────────────────────────────────────────────────
  kan_sayimi: {
    id: 'kan_sayimi', trName: 'Tam Kan Sayımı', enName: 'Complete Blood Count',
    explanation: 'Kırmızı ve beyaz kan hücrelerini, trombositleri ölçer. Anemi, enfeksiyon veya kan hastalıklarını erken tespit eder.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🩸',
  },
  biyokimya: {
    id: 'biyokimya', trName: 'Biyokimya Paneli', enName: 'Comprehensive Metabolic Panel',
    explanation: 'Karaciğer, böbrek, kan şekeri ve elektrolitler dahil genel metabolizma durumunuzu gösterir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🔬',
  },
  lipid: {
    id: 'lipid', trName: 'Lipid Paneli', enName: 'Lipid Panel',
    explanation: 'Toplam kolesterol, LDL, HDL ve trigliseridleri ölçer. Kalp hastalığı riskini gösterir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'İç Hastalıkları', icon: '💉',
    sources: [
      { name: 'ESC/EAS — Dyslipidemias Guidelines (2019)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Dyslipidaemias-Management-of' },
    ],
  },
  hba1c: {
    id: 'hba1c', trName: 'HbA1c (Şeker Takibi)', enName: 'Glycated Hemoglobin',
    explanation: 'Son 3 ayın ortalama kan şekerini gösterir. Diyabet kontrolünün altın standardıdır.',
    frequencyMonths: 3, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Endokrinoloji', icon: '🍬',
    sources: [
      { name: 'ADA — Standards of Care in Diabetes 2025', url: 'https://professional.diabetes.org/standards-of-care' },
    ],
  },
  tsh: {
    id: 'tsh', trName: 'Tiroid Testleri (TSH)', enName: 'Thyroid Function',
    explanation: 'Tiroid bezinin çalışıp çalışmadığını kontrol eder.',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Endokrinoloji', icon: '🦋',
  },
  vitamin_d: {
    id: 'vitamin_d', trName: 'D Vitamini', enName: 'Vitamin D',
    explanation: 'Kemik sağlığı ve bağışıklık için kritik. Türkiye\'de çok yaygın eksiklik var.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '☀️',
  },
  b12: {
    id: 'b12', trName: 'B12 Vitamini', enName: 'Vitamin B12',
    explanation: 'Sinir sistemi ve kan hücreleri için gerekli. Eksikliği yorgunluk ve uyuşmaya yol açar.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '💊',
  },
  idrar: {
    id: 'idrar', trName: 'Tam İdrar Tahlili', enName: 'Urinalysis',
    explanation: 'Böbrek, mesane ve diyabet komplikasyonlarını erken tespit eder.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🫧',
  },
  hepatit: {
    id: 'hepatit', trName: 'Hepatit B ve C Taraması', enName: 'Hepatitis B & C Screening',
    explanation: 'Karaciğer sirozuna ve kansere yol açabilen Hepatit B ve C virüslerini tarar.',
    frequencyMonths: 60, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji', icon: '🫘',
  },

  // ── CARDIOVASCULAR ──────────────────────────────────────────────────────────
  ekg: {
    id: 'ekg', trName: 'EKG (Kalp Ritmi)', enName: 'Electrocardiogram',
    explanation: 'Kalpte ritim bozukluğu veya iskemi belirtisi olup olmadığını gösterir.',
    frequencyMonths: 24, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Kardiyoloji', icon: '📈',
    sources: [
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },
  ekokardiyografi: {
    id: 'ekokardiyografi', trName: 'Ekokardiyografi', enName: 'Echocardiography',
    explanation: 'Kalp kasları ve kapakçıklarının ultrason görüntüsü. Kalp yetmezliği ve kapak sorunlarını tespit eder.',
    frequencyMonths: 24, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Kardiyoloji', icon: '💓',
    sources: [
      { name: 'ESC — Heart Failure Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure' },
    ],
  },
  karotis_usg: {
    id: 'karotis_usg', trName: 'Boyun Damar Ultrasonü', enName: 'Carotid Ultrasound',
    explanation: 'Boyun damarlarında plak birikimini gösterir. İnme riskini öngörür.',
    frequencyMonths: 24, ageMin: 45, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Nöroloji / Kardiyoloji', icon: '🔊',
    sources: [
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },

  // ── METABOLIC ───────────────────────────────────────────────────────────────
  karin_usg: {
    id: 'karin_usg', trName: 'Karın Ultrasonü', enName: 'Abdominal Ultrasound',
    explanation: 'Karaciğer, safra kesesi, dalak, böbrekleri görüntüler. Yağlanma ve kist tespitinde kullanılır.',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji / Radyoloji', icon: '📡',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.sciencedirect.com/science/article/pii/S0168827824003295' },
    ],
  },
  fibroscan: {
    id: 'fibroscan', trName: 'FibroScan (Karaciğer)', enName: 'Liver Fibroscan',
    explanation: 'Karaciğerdeki yağlanma ve fibrozis (sertleşme) derecesini ölçer. Non-alkolik yağlı karaciğer takibinde kritik.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji', icon: '📊',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.sciencedirect.com/science/article/pii/S0168827824003295' },
    ],
  },
  dexa: {
    id: 'dexa', trName: 'Kemik Yoğunluğu (DEXA)', enName: 'Bone Density Scan',
    explanation: 'Kemik yoğunluğunu ölçer ve osteoporoz riskini belirler.',
    frequencyMonths: 24, ageMin: 50, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Endokrinoloji / Romatoloji', icon: '🦴',
    sources: [
      { name: 'USPSTF — Osteoporosis Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening' },
      { name: 'IOF — International Osteoporosis Foundation Guidelines', url: 'https://www.osteoporosis.foundation/health-professionals/diagnosis' },
    ],
  },

  // ── CANCER SCREENINGS ───────────────────────────────────────────────────────
  kolonoskopi: {
    id: 'kolonoskopi', trName: 'Kolonoskopi', enName: 'Colonoscopy',
    explanation: 'Kolon kanseri ve poliplerini erken tespit eder. 10 yılda bir altın standarttır.',
    frequencyMonths: 120, ageMin: 45, ageMax: 75, sex: 'both', weight: 3,
    doctor: 'Gastroenteroloji', icon: '🔭',
    sources: [
      { name: 'USPSTF — Colorectal Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening' },
      { name: 'ESGE — European Colonoscopy Guidelines', url: 'https://www.esge.com/assets/downloads/pdfs/guidelines/2022_esge_annex_s2.pdf' },
    ],
  },
  mamografi: {
    id: 'mamografi', trName: 'Mamografi', enName: 'Mammography',
    explanation: 'Meme kanserini erken evrede tespit etmenin en etkili yöntemi. 2024 güncellemesiyle başlangıç yaşı 40\'a indirildi.',
    frequencyMonths: 24, ageMin: 40, ageMax: 74, sex: 'F', weight: 3,
    doctor: 'Radyoloji', icon: '🎗️',
    sources: [
      { name: 'USPSTF — Breast Cancer Screening (Nisan 2024)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening' },
    ],
  },
  pap_smear: {
    id: 'pap_smear', trName: 'Pap Smear + HPV Testi', enName: 'Cervical Screening',
    explanation: 'Serviks (rahim ağzı) kanserini önler. HPV aşısıyla birlikte en etkili kanser önleme yöntemlerinden biri.',
    frequencyMonths: 36, ageMin: 21, ageMax: 65, sex: 'F', weight: 3,
    doctor: 'Kadın Hastalıkları', icon: '🌸',
    sources: [
      { name: 'USPSTF — Cervical Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening' },
    ],
  },
  akci_bt: {
    id: 'akci_bt', trName: 'Akciğer BT (Düşük Doz)', enName: 'Low-dose CT Lung',
    explanation: 'Ağır sigara içicilerinde akciğer kanserini erken tespit eder.',
    frequencyMonths: 12, ageMin: 50, ageMax: 80, sex: 'both', weight: 3,
    doctor: 'Göğüs Hastalıkları', icon: '🫁',
    sources: [
      { name: 'USPSTF — Lung Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening' },
    ],
  },
  goz_dibi: {
    id: 'goz_dibi', trName: 'Göz Dibi Muayenesi', enName: 'Fundus Examination',
    explanation: 'Diyabet ve tansiyon kaynaklı göz hasarını erken tespit eder. Körlüğü önleyebilir.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Göz Hastalıkları', icon: '👁️',
    sources: [
      { name: 'ADA — Standards of Care in Diabetes 2025 (Bölüm 12)', url: 'https://professional.diabetes.org/standards-of-care' },
    ],
  },
  dis_kontrol: {
    id: 'dis_kontrol', trName: 'Diş Kontrolü', enName: 'Dental Check-up',
    explanation: 'Diş çürükleri ve diş eti hastalıklarının erken tespiti. Kalp hastalığıyla bağlantısı kanıtlanmıştır.',
    frequencyMonths: 6, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Diş Hekimi', icon: '🦷',
    sources: [
      { name: 'ADA — American Dental Association Recall Guidelines', url: 'https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/oral-health-topics-a-z' },
    ],
  },
  prostat: {
    id: 'prostat', trName: 'Prostat Taraması (PSA)', enName: 'Prostate Screening',
    explanation: 'Prostat kanseri riskini değerlendirmek için PSA kan testi.',
    frequencyMonths: 12, ageMin: 50, ageMax: 75, sex: 'M', weight: 3,
    doctor: 'Üroloji', icon: '🔵',
    sources: [
      { name: 'USPSTF — Prostate Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening' },
    ],
  },
}

// ── DISEASE → SCREENING MAPPING ─────────────────────────────────────────────
export const DISEASE_SCREENINGS = {

  healthy: {
    label: 'Sağlıklı', screenings: [
      { id: 'kan_sayimi', months: 12 },
      { id: 'biyokimya', months: 12 },
      { id: 'lipid', months: 12 },
      { id: 'vitamin_d', months: 12 },
      { id: 'b12', months: 12 },
      { id: 'idrar', months: 12 },
      { id: 'dis_kontrol', months: 6 },
      { id: 'hepatit', months: 60 },
    ]
  },

  hipertansiyon: {
    label: 'Yüksek Tansiyon',
    screenings: [
      { id: 'kan_sayimi', months: 6 },
      { id: 'biyokimya', months: 6 },
      { id: 'lipid', months: 6 },
      { id: 'ekg', months: 12 },
      { id: 'ekokardiyografi', months: 24 },
      { id: 'karotis_usg', months: 24 },
      { id: 'goz_dibi', months: 12 },
      { id: 'idrar', months: 6 },
    ]
  },

  diyabet: {
    label: 'Şeker Hastalığı',
    screenings: [
      { id: 'hba1c', months: 3 },
      { id: 'biyokimya', months: 3 },
      { id: 'lipid', months: 6 },
      { id: 'idrar', months: 6 },
      { id: 'goz_dibi', months: 12 },
      { id: 'ekg', months: 12 },
      { id: 'vitamin_d', months: 12 },
    ]
  },

  prediyabet: {
    label: 'Gizli Şeker (Prediyabet)',
    screenings: [
      { id: 'hba1c', months: 6 },
      { id: 'biyokimya', months: 6 },
      { id: 'lipid', months: 6 },
      { id: 'vitamin_d', months: 12 },
    ]
  },

  hiperlipidemi: {
    label: 'Yüksek Kolesterol',
    screenings: [
      { id: 'lipid', months: 6 },
      { id: 'biyokimya', months: 6 },
      { id: 'ekg', months: 24 },
    ]
  },

  obezite: {
    label: 'Aşırı Kilo / Obezite',
    screenings: [
      { id: 'lipid', months: 6 },
      { id: 'hba1c', months: 6 },
      { id: 'biyokimya', months: 6 },
      { id: 'karin_usg', months: 12 },
      { id: 'fibroscan', months: 12 },
      { id: 'ekg', months: 24 },
      { id: 'vitamin_d', months: 12 },
      { id: 'tsh', months: 12 },
    ]
  },

  yagli_karaciger: {
    label: 'Yağlı Karaciğer',
    screenings: [
      { id: 'biyokimya', months: 6 },
      { id: 'karin_usg', months: 6 },
      { id: 'fibroscan', months: 12 },
      { id: 'lipid', months: 6 },
      { id: 'hba1c', months: 6 },
    ]
  },

  kalp_damar: {
    label: 'Kalp Damar Hastalığı',
    screenings: [
      { id: 'ekg', months: 12 },
      { id: 'ekokardiyografi', months: 12 },
      { id: 'lipid', months: 6 },
      { id: 'karotis_usg', months: 12 },
      { id: 'biyokimya', months: 6 },
    ]
  },

  kemik_erimesi: {
    label: 'Kemik Erimesi',
    screenings: [
      { id: 'dexa', months: 24 },
      { id: 'vitamin_d', months: 6 },
      { id: 'biyokimya', months: 12 },
      { id: 'b12', months: 12 },
    ]
  },

  tiroid: {
    label: 'Tiroid Hastalığı',
    screenings: [
      { id: 'tsh', months: 6 },
      { id: 'biyokimya', months: 12 },
    ]
  },

  kolon_kanseri_riski: {
    label: 'Kolon Kanseri Riski',
    screenings: [
      { id: 'kolonoskopi', months: 60 },
      { id: 'kan_sayimi', months: 12 },
    ]
  },
}

// ── AVAILABLE DISEASES (for onboarding selection) ───────────────────────────
export const DISEASE_LIST = [
  { id: 'hipertansiyon', label: 'Yüksek Tansiyon',     icon: '🫀' },
  { id: 'diyabet',       label: 'Şeker Hastalığı',     icon: '🍬' },
  { id: 'prediyabet',    label: 'Gizli Şeker',         icon: '⚠️' },
  { id: 'hiperlipidemi', label: 'Yüksek Kolesterol',   icon: '🩸' },
  { id: 'obezite',       label: 'Aşırı Kilo',          icon: '⚖️' },
  { id: 'yagli_karaciger', label: 'Yağlı Karaciğer',  icon: '🫘' },
  { id: 'kalp_damar',    label: 'Kalp Damar Hastalığı',icon: '❤️' },
  { id: 'kemik_erimesi', label: 'Kemik Erimesi',       icon: '🦴' },
  { id: 'tiroid',        label: 'Tiroid Hastalığı',    icon: '🦋' },
  { id: 'kolon_kanseri_riski', label: 'Kolon Kanseri Riski', icon: '🔭' },
]
