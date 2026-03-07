// ─── SCREENING DEFINITIONS ───────────────────────────────────────────────────
// sources: tüm linkler canlı olarak doğrulanmıştır (Mart 2026)

export const SCREENINGS = {

  // ── RUTIN LAB ────────────────────────────────────────────────────────────────
  kan_sayimi: {
    id: 'kan_sayimi', trName: 'Tam Kan Sayımı', enName: 'Complete Blood Count',
    explanation: 'Kırmızı ve beyaz kan hücrelerini, trombositleri ölçer. Anemi, enfeksiyon veya kan hastalıklarını erken tespit eder.',
    recommendation: 'Asemptomatik yetişkinlerde yılda bir tam kan sayımı önerilir. Kronik hastalığı olanlarda 6 ayda bir takip gerekebilir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🩸',
    sources: [
      { name: 'WHO — Integrated Chronic Disease Prevention', url: 'https://www.who.int/publications/i/item/9789240001220' },
      { name: 'USPSTF — Preventive Care Guidelines', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/topic_search_results?topic_status=P' },
    ],
  },

  biyokimya: {
    id: 'biyokimya', trName: 'Biyokimya Paneli', enName: 'Comprehensive Metabolic Panel',
    explanation: 'Karaciğer, böbrek, kan şekeri ve elektrolitler dahil genel metabolizma durumunuzu gösterir.',
    recommendation: 'Yılda bir rutin biyokimya paneli, erken organ hasarını tespit etmenin temel yoludur. Hipertansiyon veya diyabet hastalarında 6 ayda bir yapılmalıdır.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🔬',
    sources: [
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
      { name: 'ADA — Standards of Care in Diabetes 2025 (Bölüm 10)', url: 'https://professional.diabetes.org/standards-of-care' },
    ],
  },

  lipid: {
    id: 'lipid', trName: 'Lipid Paneli', enName: 'Lipid Panel',
    explanation: 'Toplam kolesterol, LDL, HDL ve trigliseridleri ölçer. Kalp hastalığı riskini gösterir.',
    recommendation: 'LDL hedefi: Düşük risk <116 mg/dL, orta risk <100, yüksek risk <70, çok yüksek risk <55 mg/dL. Statin kullananlarda 6–12 haftada bir kontrol, hedef sağlananlar için yılda bir yeterlidir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'İç Hastalıkları', icon: '💉',
    sources: [
      { name: 'ESC/EAS — Dyslipidaemias Guidelines (2019)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Dyslipidaemias-Management-of' },
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },

  hba1c: {
    id: 'hba1c', trName: 'HbA1c (Şeker Takibi)', enName: 'Glycated Hemoglobin',
    explanation: 'Son 3 ayın ortalama kan şekerini gösterir. Diyabet kontrolünün altın standardıdır.',
    recommendation: 'Hedef HbA1c genellikle < %7.0 (bireyselleştirilmiş). Kontrolsüz veya ilaç değişikliği yapılan hastalarda 3 ayda bir; hedefte olan hastalarda 6 ayda bir yeterlidir.',
    frequencyMonths: 3, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Endokrinoloji', icon: '🍬',
    sources: [
      { name: 'ADA — Standards of Care in Diabetes 2025 (Bölüm 6)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'ADA Diabetes Care — Glycemic Targets (2025)', url: 'https://diabetesjournals.org/care/article/48/Supplement_1/S111/157547' },
    ],
  },

  tsh: {
    id: 'tsh', trName: 'Tiroid Testleri (TSH)', enName: 'Thyroid Function',
    explanation: 'Tiroid bezinin çalışıp çalışmadığını kontrol eder. Hem hiperaktif (hipertiroidi) hem de düşük aktif (hipotiroidi) tiroid erken tedaviyle düzelir.',
    recommendation: 'Normal TSH aralığı: 0.4–4.0 mIU/L. Tedavi altındaki hastalarda 6 ayda bir; stabil hastalarda yılda bir kontrol önerilir.',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Endokrinoloji', icon: '🦋',
    sources: [
      { name: 'ATA — Hypothyroidism Guidelines (2014)', url: 'https://www.liebertpub.com/doi/10.1089/thy.2014.0028' },
      { name: 'ETA — European Thyroid Association Guidelines', url: 'https://www.eurothyroid.com/files/download/ETA-Guideline-Management-of-subclinical-hypothyroidism.pdf' },
    ],
  },

  vitamin_d: {
    id: 'vitamin_d', trName: 'D Vitamini', enName: 'Vitamin D (25-OH)',
    explanation: 'Kemik sağlığı, bağışıklık ve kas gücü için kritik. Türkiye\'de popülasyonun %70-80\'inde eksiklik saptanmaktadır.',
    recommendation: 'Yeterlilik eşiği: >30 ng/mL. Eksiklik: <20 ng/mL → yükleme tedavisi gerekir. Kemik erimesi, diyabet veya bağışıklık sorunlarında 6 ayda bir takip.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '☀️',
    sources: [
      { name: 'Endocrine Society — Vitamin D Deficiency Guidelines (2011, 2024 güncelleme)', url: 'https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-deficiency' },
      { name: 'USPSTF — Vitamin D Deficiency Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/vitamin-d-deficiency-screening' },
    ],
  },

  b12: {
    id: 'b12', trName: 'B12 Vitamini', enName: 'Vitamin B12',
    explanation: 'Sinir sistemi ve kan hücreleri için gerekli. Eksikliği yorgunluk, uyuşma ve megaloblastik anemiye yol açar. Metformin kullanan diyabet hastalarında eksiklik riski yüksektir.',
    recommendation: 'Normal aralık: 200–900 pg/mL. Metformin kullanımı B12 emilimini bozar → yılda bir kontrol önerilir. Vejeteryanlar ve 50 yaş üstü bireylerde tarama endikasyonu artar.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '💊',
    sources: [
      { name: 'ADA — Metformin and B12 Deficiency (Standards of Care 2025)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'BMJ — Vitamin B12 deficiency (Clinical Review)', url: 'https://www.bmj.com/content/349/bmj.g5226' },
    ],
  },

  idrar: {
    id: 'idrar', trName: 'Tam İdrar Tahlili', enName: 'Urinalysis',
    explanation: 'Böbrek, mesane ve diyabet komplikasyonlarını erken tespit eder. Mikroalbüminüri, diyabetik nefropatinin en erken işaretidir.',
    recommendation: 'Diyabet ve hipertansiyon hastalarında yılda bir idrar tahlili ve mikroalbümin/kreatinin oranı önerilir. Pozitif mikroalbüminüri → nefroloji konsültasyonu.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'İç Hastalıkları', icon: '🫧',
    sources: [
      { name: 'ADA — Chronic Kidney Disease and Diabetes (2025)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'KDIGO — CKD Evaluation and Management (2022)', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
    ],
  },

  hepatit: {
    id: 'hepatit', trName: 'Hepatit B ve C Taraması', enName: 'Hepatitis B & C Screening',
    explanation: 'Karaciğer sirozuna ve kansere yol açabilen Hepatit B ve C virüslerini tarar. Çoğu hasta yıllarca belirti vermez.',
    recommendation: 'Tüm erişkinlere hayatında en az bir kez HCV taraması önerilir (USPSTF B önerisi). HBsAg negatif ve aşısız bireylere Hepatit B aşılaması yapılmalıdır.',
    frequencyMonths: 60, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji', icon: '🫘',
    sources: [
      { name: 'USPSTF — Hepatitis C Screening (2020)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hepatitis-c-screening' },
      { name: 'USPSTF — Hepatitis B Screening (2020)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hepatitis-b-virus-infection-screening-adolescents-and-adults' },
    ],
  },

  // ── KARDİYOVASKÜLER ──────────────────────────────────────────────────────────
  ekg: {
    id: 'ekg', trName: 'EKG (Kalp Ritmi)', enName: 'Electrocardiogram',
    explanation: 'Kalpte ritim bozukluğu, iletim bloğu veya sessiz iskemi olup olmadığını gösterir.',
    recommendation: 'Hipertansiyon, diyabet veya semptom olan hastalarda yılda bir EKG önerilir. 40 yaş üstü asemptomatik bireylerde risk değerlendirmesiyle birlikte 2 yılda bir yapılabilir.',
    frequencyMonths: 24, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Kardiyoloji', icon: '📈',
    sources: [
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
      { name: 'AHA/ACC — Cardiovascular Risk Assessment (2019)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000678' },
    ],
  },

  ekokardiyografi: {
    id: 'ekokardiyografi', trName: 'Ekokardiyografi', enName: 'Echocardiography',
    explanation: 'Kalp kasları ve kapakçıklarının ultrason görüntüsü. Kalp yetmezliği, kapak hastalığı ve sol ventrikül hipertrofisini tespit eder.',
    recommendation: 'Kontrol altına alınamayan hipertansiyon, semptomatik kalp hastalığı veya yüksek kardiyovasküler risk varlığında endikedir. Asemptomatik yüksek risk grubunda 2 yılda bir değerlendirme.',
    frequencyMonths: 24, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Kardiyoloji', icon: '💓',
    sources: [
      { name: 'ESC — Heart Failure Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure' },
      { name: 'ESC — Hypertension Guidelines (2023)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/2023-ESH-ESC-Guidelines-for-the-management-of-arterial-hypertension' },
    ],
  },

  karotis_usg: {
    id: 'karotis_usg', trName: 'Boyun Damar Ultrasonü', enName: 'Carotid Ultrasound',
    explanation: 'Boyun damarlarında (karotis) plak birikimini ve damar duvarı kalınlığını (IMT) gösterir. İnme ve kalp krizi riskini öngörür.',
    recommendation: 'Hipertansiyon, hiperlipidemi veya ateroskleroz şüphesinde endikedir. IMT ölçümü kardiyovasküler risk stratifikasyonunu iyileştirir.',
    frequencyMonths: 24, ageMin: 45, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Nöroloji / Kardiyoloji', icon: '🔊',
    sources: [
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
      { name: 'AHA — Carotid Intima-Media Thickness Statement (2021)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000927' },
    ],
  },

  // ── METABOLİK / ORGAN ────────────────────────────────────────────────────────
  karin_usg: {
    id: 'karin_usg', trName: 'Karın Ultrasonü', enName: 'Abdominal Ultrasound',
    explanation: 'Karaciğer, safra kesesi, dalak, böbrekleri ve büyük damarları görüntüler. Yağlı karaciğer, taş, kist ve tümör tespitinde kullanılır.',
    recommendation: 'Obezite, yağlı karaciğer veya metabolik sendrom olan hastalarda yılda bir karın ultrasonü önerilir. Hepatit B/C taşıyıcılarında 6 ayda bir + AFP.',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji / Radyoloji', icon: '📡',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(24)00329-5/fulltext' },
      { name: 'AASLD — NAFLD Practice Guidance (2023)', url: 'https://www.aasld.org/sites/default/files/2023-06/AASLD-PracticeGuidance-NAFLD-June2023.pdf' },
    ],
  },

  fibroscan: {
    id: 'fibroscan', trName: 'FibroScan (Karaciğer Elastografisi)', enName: 'Liver Fibroscan',
    explanation: 'Karaciğerdeki yağlanma derecesini (CAP skoru) ve fibrozis/sertleşme evresini (F0–F4) ölçer. Biyopsi gerektirmeyen non-invaziv altın standarttır.',
    recommendation: 'MASLD/NAFLD tanısı olan hastalarda yılda bir FibroScan ile fibrozis evresi takip edilmelidir. F2+ fibroziste gastroenteroloji takibi zorunludur.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji', icon: '📊',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(24)00329-5/fulltext' },
      { name: 'EASL — Non-Invasive Tests for Liver Fibrosis (2021)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(21)00398-6/fulltext' },
    ],
  },

  dexa: {
    id: 'dexa', trName: 'Kemik Yoğunluğu (DEXA)', enName: 'Bone Density Scan',
    explanation: 'Kemik mineral yoğunluğunu ölçer. T-skoru -1.0 ile -2.5 arası osteopeni; -2.5 altı osteoporoz anlamına gelir.',
    recommendation: 'Tüm 65+ kadınlara ve 70+ erkeklere DEXA önerilir. Yüksek risk grubunda (uzun süreli kortikosteroid, erken menopoz) 50 yaşından itibaren başlanabilir.',
    frequencyMonths: 24, ageMin: 50, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Endokrinoloji / Romatoloji', icon: '🦴',
    sources: [
      { name: 'USPSTF — Osteoporosis Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening' },
      { name: 'IOF — Osteoporosis Clinical Guidelines', url: 'https://www.osteoporosis.foundation/health-professionals/diagnosis' },
      { name: 'ASBMR — Osteoporosis Management Guidelines', url: 'https://www.asbmr.org/education/clinical-practice-guidelines' },
    ],
  },

  // ── KANSER TARAMALARI ─────────────────────────────────────────────────────────
  kolonoskopi: {
    id: 'kolonoskopi', trName: 'Kolonoskopi', enName: 'Colonoscopy',
    explanation: 'Kolon kanseri ve poliplerini erken tespit eder. 10 yılda bir kolonoskopi; alternatif olarak yılda bir gaita testi (FIT) yapılabilir.',
    recommendation: '45–75 yaş arası tüm bireylere kolorektal kanser taraması önerilir (USPSTF A/B). Kolonoskopi 10 yılda bir altın standarttır; polip saptanırsa sıklık azalır (3–5 yıl). İlk derece akraba kolon kanseri varsa 40 yaşında veya tanı yaşından 10 yıl önce başla.',
    frequencyMonths: 120, ageMin: 45, ageMax: 75, sex: 'both', weight: 3,
    doctor: 'Gastroenteroloji', icon: '🔭',
    sources: [
      { name: 'USPSTF — Colorectal Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening' },
      { name: 'ESGE — European Colonoscopy Quality Standards (2020)', url: 'https://www.esge.com/assets/downloads/pdfs/guidelines/2020_esge_european_colorectal_cancer_screening_guidelines.pdf' },
      { name: 'ACG — Colorectal Cancer Screening Guidelines (2021)', url: 'https://journals.lww.com/ajg/fulltext/2021/03000/acg_clinical_guidelines__colorectal_cancer.15.aspx' },
    ],
  },

  mamografi: {
    id: 'mamografi', trName: 'Mamografi', enName: 'Mammography',
    explanation: 'Meme kanserini erken evrede tespit etmenin en etkili yöntemi. 2024 USPSTF güncellemesiyle başlangıç yaşı 50\'den 40\'a indirildi.',
    recommendation: '40–74 yaş arası tüm kadınlara 2 yılda bir mamografi önerilir (USPSTF B, 2024). Yüksek risk (BRCA mutasyonu, aile öyküsü) varlığında yılda bir ve MRI eklenir.',
    frequencyMonths: 24, ageMin: 40, ageMax: 74, sex: 'F', weight: 3,
    doctor: 'Radyoloji', icon: '🎗️',
    sources: [
      { name: 'USPSTF — Breast Cancer Screening (Nisan 2024)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening' },
      { name: 'ESMO — Breast Cancer Early Detection Guidelines', url: 'https://www.esmo.org/guidelines/early-breast-cancer' },
    ],
  },

  pap_smear: {
    id: 'pap_smear', trName: 'Pap Smear + HPV Testi', enName: 'Cervical Screening',
    explanation: 'Serviks (rahim ağzı) kanserini önler. Pap smear sitoloji + HPV ko-testi en etkili tarama yöntemidir.',
    recommendation: '21–29 yaş: 3 yılda bir Pap smear. 30–65 yaş: 5 yılda bir HPV testi + Pap smear (ko-test) veya 3 yılda bir yalnızca Pap smear. HPV aşısı yaptırmak taramayı ortadan kaldırmaz.',
    frequencyMonths: 36, ageMin: 21, ageMax: 65, sex: 'F', weight: 3,
    doctor: 'Kadın Hastalıkları', icon: '🌸',
    sources: [
      { name: 'USPSTF — Cervical Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening' },
      { name: 'ESGO — European Cervical Cancer Screening Guidelines', url: 'https://www.esgo.org/education/cervical-cancer/' },
    ],
  },

  akci_bt: {
    id: 'akci_bt', trName: 'Akciğer BT (Düşük Doz)', enName: 'Low-Dose CT — Lung Cancer',
    explanation: 'Ağır sigara içicilerinde akciğer kanserini erken tespit eder. Yüksek riskli grupta mortaliteyi %20 azaltır.',
    recommendation: '50–80 yaş arası, 20+ paket-yıl sigara içen veya son 15 yıl içinde bırakmış bireylere yılda bir düşük doz BT önerilir (USPSTF B).',
    frequencyMonths: 12, ageMin: 50, ageMax: 80, sex: 'both', weight: 3,
    doctor: 'Göğüs Hastalıkları', icon: '🫁',
    sources: [
      { name: 'USPSTF — Lung Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening' },
      { name: 'ESMO — Lung Cancer Screening Guidelines', url: 'https://www.esmo.org/guidelines/lung-cancer' },
    ],
  },

  goz_dibi: {
    id: 'goz_dibi', trName: 'Göz Dibi Muayenesi', enName: 'Dilated Fundus Examination',
    explanation: 'Diyabetik retinopati ve hipertansif retinopatiyi erken tespit eder. Tedavi edilmezse körlüğe yol açabilir.',
    recommendation: 'Tip 2 diyabette tanı anında, Tip 1 diyabette tanıdan 5 yıl sonra göz dibi muayenesi yapılmalıdır. Retinopati yoksa yılda bir, bulgu varsa 3–6 ayda bir tekrar.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Göz Hastalıkları', icon: '👁️',
    sources: [
      { name: 'ADA — Retinopathy Screening (Standards of Care 2025, Bölüm 12)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'AAO — Diabetic Retinopathy Guidelines', url: 'https://www.aao.org/preferred-practice-pattern/diabetic-retinopathy-pppp' },
    ],
  },

  dis_kontrol: {
    id: 'dis_kontrol', trName: 'Diş Kontrolü', enName: 'Dental Check-up',
    explanation: 'Diş çürükleri ve periodontal (diş eti) hastalıklarının erken tespiti. Periodontal hastalık kalp hastalığı ve diyabet kontrolünü olumsuz etkiler.',
    recommendation: 'Altı ayda bir diş hekimi kontrolü ve profesyonel temizlik önerilir. Diyabet hastalarında periodontal tedavi HbA1c\'yi düşürür.',
    frequencyMonths: 6, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Diş Hekimi', icon: '🦷',
    sources: [
      { name: 'ADA — Periodontal Disease and Diabetes (2022)', url: 'https://diabetesjournals.org/care/article/45/Supplement_1/S246/138907' },
      { name: 'EFP — European Periodontal Guidelines (2022)', url: 'https://www.efp.org/publications/clinical-guidelines/' },
    ],
  },

  prostat: {
    id: 'prostat', trName: 'Prostat Taraması (PSA)', enName: 'Prostate-Specific Antigen Screening',
    explanation: 'PSA kan testi prostat kanseri riskini değerlendirmek için kullanılır. Yaşa göre normallik aralıkları değişir.',
    recommendation: '55–69 yaş arası erkeklerde PSA taraması kişiselleştirilmiş karar gerektirir (USPSTF C). Siyahi erkekler ve birinci derece akraba öyküsü olanlar 40–45 yaşında başlayabilir. Yüksek PSA → üroloji konsültasyonu.',
    frequencyMonths: 12, ageMin: 50, ageMax: 75, sex: 'M', weight: 3,
    doctor: 'Üroloji', icon: '🔵',
    sources: [
      { name: 'USPSTF — Prostate Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening' },
      { name: 'EAU — Prostate Cancer Guidelines (2024)', url: 'https://uroweb.org/guidelines/prostate-cancer' },
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
      { id: 'b12', months: 12 },
      { id: 'dis_kontrol', months: 6 },
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
  { id: 'hipertansiyon', label: 'Yüksek Tansiyon',      icon: '🫀' },
  { id: 'diyabet',       label: 'Şeker Hastalığı',      icon: '🍬' },
  { id: 'prediyabet',    label: 'Gizli Şeker',          icon: '⚠️' },
  { id: 'hiperlipidemi', label: 'Yüksek Kolesterol',    icon: '🩸' },
  { id: 'obezite',       label: 'Aşırı Kilo',           icon: '⚖️' },
  { id: 'yagli_karaciger', label: 'Yağlı Karaciğer',   icon: '🫘' },
  { id: 'kalp_damar',    label: 'Kalp Damar Hastalığı', icon: '❤️' },
  { id: 'kemik_erimesi', label: 'Kemik Erimesi',        icon: '🦴' },
  { id: 'tiroid',        label: 'Tiroid Hastalığı',     icon: '🦋' },
  { id: 'kolon_kanseri_riski', label: 'Kolon Kanseri Riski', icon: '🔭' },
]
