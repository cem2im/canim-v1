// ─── SCREENING DEFINITIONS ───────────────────────────────────────────────────
// Kılavuz uyumu:
//   USPSTF Grade A/B = en güçlü öneri (zorunlu)
//   USPSTF Grade C   = bireysel karar (dahil edilebilir)
//   USPSTF Grade D   = aktif olarak ÖNERMEZ (genel nüfustan çıkarıldı)
//   USPSTF Grade I   = yetersiz kanıt (genel nüfustan çıkarıldı)
//   ESC/ADA/EASL     = hastalık grupları için spesifik öneriler
// Tüm URL'ler canlı olarak doğrulanmıştır (Mart 2026)

export const SCREENINGS = {

  // ── RUTIN LAB ────────────────────────────────────────────────────────────────
  kan_sayimi: {
    id: 'kan_sayimi', trName: 'Tam Kan Sayımı', enName: 'Complete Blood Count',
    nameMedical: 'Tam Kan Sayımı (CBC)',
    why: 'Anemi, enfeksiyon ve gizli kan hastalıklarını erken tespit eder. Diyabet ve hipertansiyon hastalarında kalpte ek yük yaratan anemiyi dışlamak için zorunludur.',
    layer: 1,
    guideline: 'AHA/ACC 2025 Hipertansiyon Kılavuzu',
    explanation: 'Kırmızı ve beyaz kan hücrelerini, trombositleri ölçer. Anemi, enfeksiyon veya kan hastalıklarını tespit eder.',
    recommendation: 'Asemptomatik sağlıklı yetişkinde rutin tam kan sayımı taraması için hiçbir kılavuz desteği yoktur (USPSTF hiçbir grade vermemiştir). Kronik hastalık grubunda ise zorunludur: AHA/ACC 2025 Hipertansiyon Kılavuzu, tüm hipertansiyon hastalarında başlangıç teşhis panelinde CBC\'yi zorunlu kılmaktadır — gizli anemi, zaten yüksek ardyük altındaki kalpte ek iş yükü yaratır ve kalp yetmezliğini hızlandırabilir. ADA 2024/2025: Kapsamlı başlangıç değerlendirmesinde ve yıllık izlemde CBC zorunlu — HbA1c güvenilirliği için anemi/hemoglobinopati dışlanması gerekir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · İç Hastalıkları · Hematoloji', icon: '🩸',
    sources: [
      { name: 'AHA/ACC 2025 — Hypertension Guideline (CBC başlangıç paneli)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001356' },
      { name: 'ADA — Comprehensive Medical Evaluation (Standards of Care 2025, Bölüm 4)', url: 'https://diabetesjournals.org/care/article/48/Supplement_1/S59/157568' },
      { name: 'NCBI StatPearls — Health Screening (2023)', url: 'https://www.ncbi.nlm.nih.gov/books/NBK436014/' },
    ],
  },

  biyokimya: {
    id: 'biyokimya', trName: 'Biyokimya Paneli', enName: 'Comprehensive Metabolic Panel',
    nameMedical: 'Kapsamlı Metabolik Panel (CMP)',
    why: 'Böbrek ve karaciğer fonksiyonlarını, kan şekerini ve elektrolitleri gösterir. Erken organ hasarını tespit ederek tedaviyi yönlendirir.',
    layer: 1,
    guideline: 'ESC 2021 KVH Önleme Kılavuzu',
    explanation: 'Açlık glikozu, renal fonksiyon (kreatinin, eGFR), karaciğer enzimleri ve elektrolitler dahil metabolizma durumunuzu gösterir.',
    recommendation: 'ESC 2021 CVD Önleme Kılavuzu, kardiyovasküler risk değerlendirmesi için tüm yetişkinlerde 5 yılda bir açlık glikozu ve renal fonksiyon ölçümü önermektedir. Risk gruplarında (diyabet, hipertansiyon, KVH, obezite, ailede böbrek hastalığı, 60 yaş üstü) KDIGO 2024 kapsamlı değerlendirme önerir. ADA 2025: tüm diyabet hastalarında yılda bir eGFR + idrar albumin/kreatinin oranı (UACR). Hipertansiyon veya diyabet hastalarında 6 ayda bir takip gerekir.',
    frequencyMonths: 60, ageMin: 20, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · İç Hastalıkları · Nefroloji · Kardiyoloji', icon: '🔬',
    sources: [
      { name: 'ESC — CVD Prevention Guidelines 2021 (Bölüm 4.3: CV Risk Değerlendirmesi)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
      { name: 'KDIGO — CKD Evaluation and Management (2024, Kidney Int 2024;105:S117–S314)', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
      { name: 'ADA — Standards of Care in Diabetes 2025', url: 'https://professional.diabetes.org/standards-of-care' },
    ],
  },

  lipid: {
    id: 'lipid', trName: 'Lipid Paneli', enName: 'Lipid Panel',
    nameMedical: 'Lipid Profili (Total Kolesterol, LDL, HDL, Trigliserid)',
    why: 'Yüksek kolesterol kalp krizi ve inme riskini artırır ancak hiçbir belirti vermez. Erken tespitle ilaç ve yaşam tarzı değişiklikleriyle kolayca kontrol altına alınabilir.',
    layer: 1,
    guideline: 'ESC/EAS 2019 Dislipidemi Kılavuzu',
    explanation: 'Toplam kolesterol, LDL, HDL ve trigliseridleri ölçer. Kalp hastalığı riskini gösterir.',
    recommendation: 'ACC/AHA 2018: 20 yaşından itibaren her 4–6 yılda bir lipid profili. LDL hedefleri (ESC/EAS 2019): Düşük risk <116 mg/dL, orta risk <100 mg/dL, yüksek risk <70 mg/dL, çok yüksek risk <55 mg/dL. ESC/EAS 2025 Odaklanmış Güncelleme: Yeni "Aşırı yüksek risk" kategorisi (maksimal tedaviye rağmen tekrarlayan olaylar veya çok damar hastalığı) için LDL-C <40 mg/dL (1.0 mmol/L) hedefi (Sınıf IIb). Lp(a) ölçümü hayatında en az bir kez önerilir. Statin kullananlarda 6–12 haftada bir kontrol, hedef sağlananlar için yılda bir yeterlidir.',
    frequencyMonths: 12, ageMin: 20, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · İç Hastalıkları · Kardiyoloji · Endokrinoloji', icon: '💉',
    sources: [
      { name: 'ESC/EAS — Dyslipidaemias Guidelines (2019)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Dyslipidaemias-Management-of' },
      { name: 'ESC/EAS — 2025 Focused Update on Dyslipidaemias', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Dyslipidaemias-Management-of' },
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },

  hba1c: {
    id: 'hba1c', trName: 'HbA1c (Şeker Takibi)', enName: 'Glycated Hemoglobin',
    nameMedical: 'Glikozile Hemoglobin (HbA1c)',
    why: 'Son 3 ayın ortalama kan şekerini gösterir. Yüksek HbA1c göz, böbrek ve sinir hasarına yol açar; erken kontrol bu komplikasyonları önler.',
    layer: 1,
    guideline: 'ADA Standart Bakım Kılavuzu 2025',
    explanation: 'Son 3 ayın ortalama kan şekerini gösterir. Diyabet kontrolünün altın standardıdır.',
    recommendation: 'Tarama: ADA 2025, risk faktöründen bağımsız olarak 35 yaş üstü tüm yetişkinlerde diyabet taramasını önermektedir. USPSTF 2021 Grade B: 35–70 yaş, fazla kilolu/obez yetişkinlerde. Normal ise 3 yılda bir tekrar; prediyabette yılda bir. Tedavi hedefleri: Çoğu yetişkinde <7,0%; kısa hastalık süresi olan genç hastalarda <6,5%; kompleks/yaşlı hastalarda <8,0%. Kontrolsüz veya ilaç değişikliği yapılan hastalarda 3 ayda bir; hedefte olan hastalarda 6 ayda bir yeterlidir.',
    frequencyMonths: 3, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Endokrinoloji · İç Hastalıkları', icon: '🍬',
    sources: [
      { name: 'ADA — Standards of Care in Diabetes 2025 (Bölüm 6)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'ADA Diabetes Care — Glycemic Targets (2025)', url: 'https://diabetesjournals.org/care/article/48/Supplement_1/S111/157547' },
      { name: 'USPSTF — Prediabetes and Type 2 Diabetes Screening (2021, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes' },
    ],
  },

  tsh: {
    id: 'tsh', trName: 'Tiroid Testleri (TSH)', enName: 'Thyroid Function',
    nameMedical: 'Tiroid Stimülan Hormon (TSH)',
    why: 'Tiroid bezi yavaşlayınca yorgunluk, kilo artışı ve depresyon; aşırı çalışınca çarpıntı ve kilo kaybı görülür. TSH testi tek ölçümle ikisini de tespit eder.',
    layer: 1,
    guideline: 'ATA/AACE 2012 Tiroid Kılavuzu',
    explanation: 'Tiroid bezinin çalışıp çalışmadığını kontrol eder. Hem hiperaktif (hipertiroidi) hem de düşük aktif (hipotiroidi) tiroid erken tedaviyle düzelir.',
    recommendation: 'ÖNEMLİ UYARI — Kılavuzlar arasında görüş ayrılığı mevcuttur: USPSTF 2015, asemptomatik gebe olmayan yetişkinlerde rutin TSH taraması için yetersiz kanıt bildirmiş (Grade I) ve bu öneri güncellenmemiştir (Ann Intern Med 2015;162:641–650). Buna karşın ATA/AACE 2012 kılavuzu, 35 yaşından itibaren 5 yılda bir tarama önermektedir. Normal TSH aralığı: 0,4–4,0 mIU/L. Tedavi genel olarak TSH >10 mIU/L olduğunda değerlendirilir. Tedavi altındaki hastalarda 6 ayda bir; stabil hastalarda yılda bir kontrol önerilir. Bu uygulama TSH taramasını yalnızca tiroid hastalığı ve yüksek riskli gruplara göstermektedir.',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · Endokrinoloji · İç Hastalıkları', icon: '🦋',
    sources: [
      { name: 'USPSTF — Thyroid Dysfunction Screening (2015, Grade I; Ann Intern Med 2015;162:641–650)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/thyroid-dysfunction-screening' },
      { name: 'ATA — Hypothyroidism Guidelines (2014)', url: 'https://www.liebertpub.com/doi/10.1089/thy.2014.0028' },
      { name: 'ETA — European Thyroid Association Guidelines', url: 'https://www.eurothyroid.com/files/download/ETA-Guideline-Management-of-subclinical-hypothyroidism.pdf' },
    ],
  },

  vitamin_d: {
    id: 'vitamin_d', trName: 'D Vitamini', enName: 'Vitamin D (25-OH)',
    nameMedical: '25-Hidroksi Vitamin D (25-OH-D)',
    why: 'Kemik sağlığı, bağışıklık ve kas gücü için kritik. Obezite ve kemik erimesi hastalarında eksiklik riski yüksek olup kırık riskini artırır.',
    layer: 1,
    guideline: 'Endocrine Society 2024 Vitamin D Kılavuzu',
    explanation: 'Kemik sağlığı, bağışıklık ve kas gücü için kritik. Obezite ve kemik erimesi hastalarında eksiklik riski yüksektir.',
    recommendation: 'ÖNEMLİ GÜNCELLEME (2024): Hem USPSTF 2021 (Grade I — yetersiz kanıt) hem de Endocrine Society 2024 kılavuzu (JCEM 2024;109:1907–1947), genel sağlıklı yetişkinde rutin 25(OH)D testi yapılmasını önermemektedir. Endocrine Society 2024, obezite, prediyabet veya koyu tenli olmak dahil hiçbir risk grubu için rutin test önermemekte; sayısal eşik değerleri (eski 2011 kılavuzundaki <20 veya <30 ng/mL) tamamen terk edilmiştir. Endocrine Society 2024, test yapmaksızın ampirik takviye önermektedir: 1–18 yaş çocuklar (raşitizm önlemi), gebe kadınlar, 75 yaş üstü yetişkinler (mortalite azaltımı), yüksek riskli prediyabetikler. Bu uygulamada D vitamini testi yalnızca risk faktörü olan hastalara (obezite, kemik erimesi) gösterilmektedir.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · Endokrinoloji · İç Hastalıkları', icon: '☀️',
    sources: [
      { name: 'USPSTF — Vitamin D Deficiency Screening (2021, Grade I)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/vitamin-d-deficiency-screening' },
      { name: 'Endocrine Society — Vitamin D Guideline (2024, JCEM 2024;109:1907–1947)', url: 'https://academic.oup.com/jcem/article/109/8/1907/7619140' },
    ],
  },

  b12: {
    id: 'b12', trName: 'B12 Vitamini', enName: 'Vitamin B12',
    nameMedical: 'Vitamin B12 (Kobalamin)',
    why: 'Metformin uzun süreli kullanımı B12 emilimini bozar. Eksiklik sinir hasarına ve kansızlığa yol açar; erken tespit ile takviye ile önlenebilir.',
    layer: 1,
    guideline: 'ADA Standart Bakım Kılavuzu 2025',
    explanation: 'Sinir sistemi ve kan hücreleri için gerekli. Eksikliği yorgunluk, uyuşma ve megaloblastik anemiye yol açar. Metformin kullanan diyabet hastalarında malabsorpsiyon riski yüksektir.',
    recommendation: 'ADA 2025 kılavuzu, metformin kullanan diyabetik hastalarda periyodik B12 izlemini önermektedir. Asemptomatik genel popülasyonda rutin B12 taraması için uluslararası kılavuz desteği yoktur; bu nedenle yalnızca metformin kullanan hastalarda gösterilmektedir.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · İç Hastalıkları · Endokrinoloji · Nöroloji', icon: '💊',
    sources: [
      { name: 'ADA — Metformin and B12 Deficiency (Standards of Care 2025, Bölüm 9)', url: 'https://professional.diabetes.org/standards-of-care' },
    ],
  },

  idrar: {
    id: 'idrar', trName: 'İdrar Albumin/Kreatinin Oranı (UACR)', enName: 'Urine Albumin-to-Creatinine Ratio',
    nameMedical: 'İdrar Albumin/Kreatinin Oranı (UACR)',
    why: 'Böbrek hasarının en erken göstergesidir. Diyabet ve hipertansiyonu olan hastalarda böbrekleri korumak için kritik; erken tespit ile böbrek yetmezliği önlenebilir.',
    layer: 1,
    guideline: 'ADA Standart Bakım Kılavuzu 2025 / AHA/ACC 2025 Hipertansiyon Kılavuzu',
    explanation: 'Böbrek ve diyabet komplikasyonlarını erken tespit eder. İdrar albumin/kreatinin oranı (UACR), diyabetik nefropatinin en erken göstergesidir. Rutin dipstik idrar tahlili bu amaçla yeterli değildir.',
    recommendation: 'USPSTF, asemptomatik sağlıklı yetişkinde rutin idrar tahlilini önermemektedir (Grade D). Klinik açıdan anlamlı test genel dipstik idrar değil, idrar albumin/kreatinin oranıdır (UACR). ADA 2025 (Bölüm 11): Tüm Tip 2 diyabet ve tanıdan ≥5 yıl geçmiş Tip 1 diyabetiklere yılda bir UACR + eGFR. KDIGO 2024: Diyabet, hipertansiyon, KBH riski taşıyan herkese UACR + eGFR. AHA/ACC 2025 Hipertansiyon Kılavuzu (kritik güncelleme): UACR, 2017 kılavuzunda "isteğe bağlı" iken 2025 güncellemesinde tüm hipertansiyon hastalarında başlangıç değerlendirmesinde zorunlu hale getirildi — hipertansif nefrosklerozu ve KBH\'ı erken tespit etmek ve böbrek-koruyucu tedaviyi (ACE inhibitörü/ARB) yönlendirmek için.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Aile Hekimi · İç Hastalıkları · Nefroloji · Üroloji', icon: '🫧',
    sources: [
      { name: 'AHA/ACC 2025 — Hypertension Guideline (UACR zorunlu, Bölüm 7)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001356' },
      { name: 'ADA — CKD and Diabetes (Standards of Care 2025, Bölüm 11)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'KDIGO — CKD Evaluation and Management (2024, Kidney Int 2024;105:S117–S314)', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/' },
    ],
  },

  hepatit: {
    id: 'hepatit', trName: 'Hepatit B ve C Taraması', enName: 'Hepatitis B & C Screening',
    nameMedical: 'Hepatit B Yüzey Antijeni (HBsAg) + Anti-HCV Antikor Testi',
    why: 'Hepatit B ve C virüsleri yıllarca belirti vermeden karaciğere zarar verir. Erken tespit ile tam iyileşme veya karaciğer kanserinin önlenmesi mümkündür.',
    layer: 1,
    guideline: 'USPSTF 2020 Grade B / CDC 2023',
    explanation: 'Karaciğer sirozuna ve kansere yol açabilen Hepatit B ve C virüslerini tarar. Çoğu hasta yıllarca belirti vermez.',
    recommendation: 'HCV: USPSTF 2020 Grade B — 18–79 yaş tüm yetişkinlere evrensel, hayatında bir kez HCV taraması; süregelen risk varlığında periyodik tekrar. HBV (USPSTF): USPSTF 2020 Grade B — risk tabanlıdır, evrensel değildir; yalnızca risk faktörü olan yetişkinlere önerilir. HBV (CDC): CDC 2023 (MMWR 2023;72:RR-1) önemli güncelleme — 18 yaş üstü tüm yetişkinlere üçlü panel (HBsAg + anti-HBs + anti-HBc) ile evrensel, hayatında bir kez HBV taraması önermektedir. Bu, USPSTF\'nin risk tabanlı yaklaşımından daha geniş kapsamlıdır. HBsAg negatif ve aşısız bireylere Hepatit B aşılaması yapılmalıdır.',
    frequencyMonths: 999, ageMin: 18, ageMax: 79, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Gastroenteroloji · Enfeksiyon Hastalıkları', icon: '🫘',
    sources: [
      { name: 'USPSTF — Hepatitis C Screening (2020, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hepatitis-c-screening' },
      { name: 'USPSTF — Hepatitis B Screening (2020, Grade B — risk-based)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hepatitis-b-virus-infection-screening-adolescents-and-adults' },
      { name: 'CDC MMWR — Hepatitis B Universal Screening for Adults (2023, MMWR 2023;72:RR-1)', url: 'https://www.cdc.gov/mmwr/volumes/72/rr/rr7201a1.htm' },
    ],
  },

  // ── KARDİYOVASKÜLER ──────────────────────────────────────────────────────────
  ekg: {
    id: 'ekg', trName: 'EKG (Kalp Ritmi)', enName: 'Electrocardiogram',
    nameMedical: 'Elektrokardiyografi (EKG/ECG)',
    why: 'Kalpte gizli ritim bozukluğu veya iskemi olup olmadığını gösterir. Hipertansiyon ve diyabet hastalarında sol ventrikül hipertrofisini tespit eder.',
    layer: 1,
    guideline: 'ESC 2021 KVH Önleme Kılavuzu',
    explanation: 'Kalpte ritim bozukluğu, iletim bloğu veya sessiz iskemi olup olmadığını gösterir.',
    recommendation: 'ÖNEMLİ GÜNCELLEME: USPSTF 2018 (JAMA 2018;319:2308), düşük riskli asemptomatik yetişkinlerde (%10 altında 10 yıllık KVH riski) rutin EKG taramasını aktif olarak önermemektedir (Grade D). Orta/yüksek risk için kanıt yetersizdir (Grade I). ESC 2021 de asemptomatik KVH risk tahmininde rutin EKG önermemektedir. EKG şu durumlarda endikedir: hipertansiyon (sol ventrikül hipertrofisi tespiti), aritmi şüphesi, kalp yetmezliği değerlendirmesi. Asemptomatik risk değerlendirmesinde tercih edilen alternatif: koroner arter kalsiyum (CAC) skoru (ACC/AHA Sınıf IIa). Bu uygulama EKG\'yi yalnızca hipertansiyon, diyabet veya kardiyak semptomu olan hastalara göstermektedir.',
    frequencyMonths: 12, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Kardiyoloji · İç Hastalıkları · Endokrinoloji', icon: '📈',
    sources: [
      { name: 'USPSTF — Resting ECG Screening (2018, Grade D for low-risk; JAMA 2018;319:2308)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/resting-ecg-screening' },
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },

  ekokardiyografi: {
    id: 'ekokardiyografi', trName: 'Ekokardiyografi', enName: 'Echocardiography',
    nameMedical: 'Transtorasik Ekokardiyografi (TTE)',
    why: 'Kalp kaslarının ve kapakçıklarının çalışıp çalışmadığını ultrasonografiyle gösterir. Kalp yetmezliğini ve hipertansiyon kaynaklı organ hasarını erken tespit eder.',
    layer: 2,
    guideline: 'ESC/ESH 2023 Hipertansiyon Kılavuzu',
    explanation: 'Kalp kasları ve kapakçıklarının ultrasonografi görüntüsü. Kalp yetmezliği, kapak hastalığı ve sol ventrikül hipertrofisini tespit eder.',
    recommendation: 'ÖNEMLİ GÜNCELLEME: Ekokardiyografi genel nüfus tarama testi değil, tanısal bir araçtır. ESC 2021 KVH Önleme Kılavuzu: Asemptomatik yetişkinlerde KV risk tahminini iyileştirmek amacıyla rutin ekokardiyografi yapılması Sınıf III (önerilmez), Düzey B\'dir. ASE 2019 Uygun Kullanım Kriterleri: Asemptomatik, endikasyonsuz hastalarda rutin tarama ekosu "Nadiren Uygun" olarak sınıflandırılmıştır. Ekokardiyografi endikasyonları: Kalp yetmezliği şüphesi (Sınıf I), hipertansiyonun organ hasarı değerlendirmesi (ESC/ESH 2023), kapak hastalığı. Bu uygulama ekoyu yalnızca kardiyak semptomu veya hipertansiyon organ hasarı olan hastalara göstermektedir.',
    frequencyMonths: 24, ageMin: 40, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Kardiyoloji · İç Hastalıkları · Nefroloji', icon: '💓',
    sources: [
      { name: 'ESC — CVD Prevention Guidelines 2021 (Sınıf III — asemptomatik taramaya karşı)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
      { name: 'ESC/ESH — Hypertension Guidelines (2023)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/2023-ESH-ESC-Guidelines-for-the-management-of-arterial-hypertension' },
    ],
  },

  karotis_usg: {
    id: 'karotis_usg', trName: 'Boyun Damar Ultrasonografisi', enName: 'Carotid Ultrasound',
    nameMedical: 'Karotis Duplex Ultrasonografisi (KİMT + Plak Değerlendirmesi)',
    why: 'Boyun damarlarında plak birikimi inme riskinin habercisidir. Erken tespitle tedavi yoğunlaştırılarak inme önlenir.',
    layer: 2,
    guideline: 'ESC 2021 KVH Önleme Kılavuzu',
    explanation: 'Boyun damarlarında (karotis) plak birikimini ve damar duvarı kalınlığını (IMT) gösterir.',
    recommendation: 'ÖNEMLİ GÜNCELLEME — Kılavuzlar arasında ayrım yapılması gerekir: Karotis İMT (intima-media kalınlığı): USPSTF 2021 (JAMA 2021;325:476), genel yetişkin popülasyonunda asemptomatik karotis darlığı taramasına aktif olarak karşı çıkmaktadır (Grade D). ACC/AHA 2013: İlk kardiyovasküler olay riski değerlendirmesinde rutin KİMT ölçümü önerilmez (Sınıf III — Yarar yok; 2010 önerisinden geri adım). Karotis Plak Değerlendirmesi (İMT\'den farklıdır): ESC 2021, KAK yoksa veya uygulanamıyorsa, tedavi eşiği yakınındaki hastalarda risk değiştirici olarak dikkate alınabilir (Sınıf IIb, Düzey B). Plak tanımı: çevre duvarın >%50 kalınlaşması veya fokal İMT ≥1,5 mm. Bu uygulama boyun damar USG\'yi yalnızca hipertansiyon veya yüksek KVH riski olan hastalara göstermektedir.',
    frequencyMonths: 24, ageMin: 45, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Nöroloji · Kardiyoloji · Vasküler Cerrahi', icon: '🔊',
    sources: [
      { name: 'USPSTF — Carotid Artery Stenosis Screening (2021, Grade D; JAMA 2021;325:476)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/carotid-artery-stenosis-screening' },
      { name: 'ESC — Cardiovascular Prevention Guidelines (2021, Sınıf IIb plak; Sınıf III İMT)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/CVD-Prevention-in-clinical-practice' },
    ],
  },

  // ── METABOLİK / ORGAN ────────────────────────────────────────────────────────
  karin_usg: {
    id: 'karin_usg', trName: 'Karın Ultrasonografisi', enName: 'Abdominal Ultrasound',
    nameMedical: 'Batın Ultrasonografisi',
    why: 'Karaciğer yağlanması, kist ve tümörleri erken tespit eder. Tedavi edilmemiş yağlı karaciğer siroza ve karaciğer kanserine ilerleyebilir.',
    layer: 2,
    guideline: 'EASL-EASD-EASO 2024 MASLD Kılavuzu',
    explanation: 'Karaciğer, safra kesesi, dalak, böbrekleri ve büyük damarları görüntüler. Yağlı karaciğer, taş, kist ve tümör tespitinde kullanılır.',
    recommendation: 'MASLD/Yağlı karaciğer taraması: EASL-EASD-EASO 2024 ve AASLD 2023, popülasyon genelinde steatotik karaciğer hastalığı için ultrason taraması önermemektedir. Konvansiyonel B-mod ultrason erken steatoz tespitinde yetersizdir (özellikle obezitede). Risk altındaki bireylerde ileri fibrozis için tercih edilen yol: önce FIB-4 skoru, ardından transient elastografi (FibroScan). HCC Gözetimi: Tüm siroz hastaları ve seçili sirotik olmayan kronik HBV taşıyıcılarında (endemik ülke kökenli, aile HCC öyküsü olan erkek >40, kadın >50 yaş) her 6 ayda bir ultrason + AFP ile karaciğer kanseri gözetimi önerilir. AFP bu gözetimde zorunlu eşlikçidir (opsiyonel değil).',
    frequencyMonths: 12, ageMin: 30, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji · Radyoloji · İç Hastalıkları · Hepatoloji', icon: '📡',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(24)00329-5/fulltext' },
      { name: 'AASLD — NAFLD Practice Guidance (2023)', url: 'https://www.aasld.org/sites/default/files/2023-06/AASLD-PracticeGuidance-NAFLD-June2023.pdf' },
    ],
  },

  fibroscan: {
    id: 'fibroscan', trName: 'FibroScan (Karaciğer Elastografisi)', enName: 'Liver Fibroscan',
    nameMedical: 'Transient Elastografi (FibroScan / VCTE)',
    why: 'Karaciğerdeki sertleşme derecesini biyopsi gerekmeden ölçer. Siroza giden yolu erken tespit ederek tedaviyi zamanında başlatır.',
    layer: 2,
    guideline: 'EASL 2024 MASLD Kılavuzu',
    explanation: 'Karaciğerdeki yağlanma derecesini (CAP skoru) ve fibrozis/sertleşme evresini (F0–F4) ölçer. Biyopsi gerektirmeyen non-invaziv altın standarttır.',
    recommendation: 'EASL/AASLD kılavuzlarına göre FibroScan öncesinde FIB-4 skoru hesaplanmalıdır (ilk adım): FIB-4 <1,3 = düşük risk → birinci basamakta izlem; FIB-4 1,3–2,67 = belirsiz → FibroScan endikasyonu; FIB-4 >2,67 = yüksek risk → gastroenteroloji yönlendirmesi. 65 yaş üstü için yaşa göre düzeltilmiş eşik: FIB-4 <2,0. Karaciğer Sertlik Ölçümü (LSM) yorumu: <8 kPa = ileri fibrozis dışlanır; 8–12 kPa = belirsiz (ek test gerekebilir); >12 kPa = ileri fibrozis/cACLD düşündürür; ≥20–25 kPa = klinik açıdan anlamlı portal hipertansiyon. F2+ fibroziste gastroenteroloji takibi zorunludur.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Gastroenteroloji · Hepatoloji · İç Hastalıkları', icon: '📊',
    sources: [
      { name: 'EASL-EASD-EASO — MASLD Clinical Practice Guidelines (2024)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(24)00329-5/fulltext' },
      { name: 'EASL — Non-Invasive Tests for Liver Fibrosis (2021)', url: 'https://www.journal-of-hepatology.eu/article/S0168-8278(21)00398-6/fulltext' },
    ],
  },

  dexa: {
    id: 'dexa', trName: 'Kemik Yoğunluğu (DEXA)', enName: 'Bone Density Scan',
    nameMedical: 'Dual-Enerji X-Işını Absorbsiyometrisi (DEXA/DXA)',
    why: 'Kemik yoğunluğu düşük olduğunda kırık riski artar ancak belirti vermez. DEXA ile osteoporoz erken tespit edilir ve kırıklar önlenir.',
    layer: 2,
    guideline: 'USPSTF 2025 Osteoporoz Tarama Kılavuzu (JAMA 2025;333:498–508)',
    explanation: 'Kemik mineral yoğunluğunu ölçer. T-skoru -1.0 ile -2.5 arası osteopeni; -2.5 altı osteoporoz anlamına gelir.',
    recommendation: 'USPSTF 2025 (14 Ocak 2025 tarihli yeni final öneri; JAMA 2025;333:498–508): 65 yaş üstü tüm kadınlara DXA ile kemik mineral yoğunluğu (BMD) ölçümü (Grade B). 65 yaş altı postmenopozal kadınlara yüksek kırık riski varsa DXA BMD (Grade B). Erkekler için yetersiz kanıt (Grade I — tüm versiyonlarda değişmedi). Not: BHOF, erkeklerde ≥70 yaş veya ≥50 yaşta risk faktörü varlığında tarama önermektedir (ISCD 2023). Yüksek risk grubunda (uzun süreli kortikosteroid, erken menopoz) 50 yaşından itibaren başlanabilir.',
    frequencyMonths: 24, ageMin: 50, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Endokrinoloji · Romatoloji · Ortopedi · Aile Hekimi', icon: '🦴',
    sources: [
      { name: 'USPSTF — Osteoporosis Screening (2025, Grade B; JAMA 2025;333:498–508)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening' },
      { name: 'IOF — Osteoporosis Clinical Guidelines', url: 'https://www.osteoporosis.foundation/health-professionals/diagnosis' },
    ],
  },

  // ── KANSER TARAMALARI ─────────────────────────────────────────────────────────
  kolonoskopi: {
    id: 'kolonoskopi', trName: 'Kolonoskopi', enName: 'Colonoscopy',
    nameMedical: 'Kolonoskopi (Kolonoskopik İnceleme)',
    why: 'Kolon kanseri gelişmeden önce polipleri tespit eder ve aynı seansta çıkarır. Bu tarama kolon kanserini %90 oranında önleyebilir.',
    layer: 2,
    guideline: 'USPSTF 2021 Grade A (50–75 yaş) / Grade B (45–49 yaş)',
    explanation: 'Kolon kanseri ve poliplerini erken tespit eder. Polip görüldüğünde aynı seansta çıkarılabilir. Aile öyküsü başlangıç yaşını ve sıklığı önemli ölçüde değiştirir.',
    recommendation: 'USPSTF 2021: 45–49 yaş Grade B, 50–75 yaş Grade A. Ortalama risk seçenekleri: kolonoskopi 10 yılda bir (altın standart), FIT gaita testi yılda bir, BT kolonografi 5 yılda bir. ⚠️ AİLE ÖYKÜSÜ KURALLARI (NCCN/ACS): (1) 60 yaş altında KRK olan 1. derece akraba VEYA herhangi yaşta ≥2 akraba → 40 yaşında ya da en genç tanıdan 10 yıl önce başla, her 5 yılda bir kolonoskopi; dışkı testi kabul edilmez. (2) 60 yaş ve üstünde KRK olan 1 akraba → 40 yaşında başla, her 10 yılda bir kolonoskopi. (3) Lynch sendromu → her 1–2 yılda bir, 20–25 yaşından itibaren. (4) FAP → her yıl, 12–15 yaşından itibaren.',
    frequencyMonths: 120, ageMin: 45, ageMax: 75, sex: 'both', weight: 3,
    doctor: 'Gastroenteroloji · Genel Cerrahi · Aile Hekimi', icon: '🔭',
    sources: [
      { name: 'USPSTF — Colorectal Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening' },
      { name: 'ESGE — European Colonoscopy Quality Standards (2020)', url: 'https://www.esge.com/assets/downloads/pdfs/guidelines/2020_esge_european_colorectal_cancer_screening_guidelines.pdf' },
      { name: 'ACG — Colorectal Cancer Screening Guidelines (2021)', url: 'https://journals.lww.com/ajg/fulltext/2021/03000/acg_clinical_guidelines__colorectal_cancer.15.aspx' },
    ],
  },

  mamografi: {
    id: 'mamografi', trName: 'Mamografi', enName: 'Mammography',
    nameMedical: 'Dijital Mamografi (veya DBT — Dijital Breast Tomosynthesis)',
    why: 'Meme kanserini erken evrede tespit etmenin en etkili yöntemidir. Erken tespit ile tedavi başarısı %95\'in üzerindedir.',
    layer: 2,
    guideline: 'USPSTF 2024 Grade B',
    explanation: 'Meme kanserini erken evrede tespit etmenin en etkili yöntemi. Aile öyküsü başlangıç yaşını ve sıklığı önemli ölçüde değiştirir.',
    recommendation: 'ORTALAMA RİSK — USPSTF 2024 Grade B: 40–74 yaş tüm kadınlara 2 yılda bir mamografi. ⚠️ AİLE ÖYKÜSÜ KURALLARI (ACS/NCCN): Yaşam boyu risk ≥%20 VEYA BRCA1/2 mutasyonu VEYA 1. derece akrabada BRCA mutasyonu → 30 yaşında yılda bir mamografi + yılda bir meme MRI (tamamlayıcı, tek başına MRI yetersiz). "10 yıl önce kuralı": tarama, ailedeki en erken tanıdan 10 yıl önce başlar (en erken 30 yaş). BRCA1 taşıyıcılarında 6 ayda bir klinik muayene düşünülebilir (ESMO). Türkiye Sağlık Bakanlığı: 40–69 yaş 2 yılda bir mamografi (KETEM).',
    frequencyMonths: 24, ageMin: 30, ageMax: 74, sex: 'F', weight: 3,
    doctor: 'Radyoloji · Kadın Hastalıkları · Genel Cerrahi · Tıbbi Onkoloji', icon: '🎗️',
    sources: [
      { name: 'USPSTF — Breast Cancer Screening (Nisan 2024, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening' },
      { name: 'ACS — Breast Cancer Screening Guidelines (High Risk)', url: 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html' },
      { name: 'NCCN — Breast Cancer Screening (2024)', url: 'https://www.ncbi.nlm.nih.gov/books/NBK556050/table/article-18569.table0/' },
      { name: 'ESMO — Hereditary Breast-Ovarian Cancer Screening', url: 'https://www.researchgate.net/publication/364712474_Risk_reduction_and_screening_of_cancer_in_hereditary_breast-ovarian_cancer_syndromes_ESMO_Clinical_Practice_Guideline' },
    ],
  },

  pap_smear: {
    id: 'pap_smear', trName: 'Pap Smear + HPV Testi', enName: 'Cervical Screening',
    nameMedical: 'Servikal Sitoloji (Pap Smear) + HPV Ko-Testi',
    why: 'Serviks (rahim ağzı) kanserini oluşmadan önce tespit eder. Düzenli tarama ile serviks kanseri büyük ölçüde önlenebilir.',
    layer: 2,
    guideline: 'USPSTF 2018 Grade A',
    explanation: 'Serviks (rahim ağzı) kanserini önler. Pap smear sitoloji + HPV ko-testi en etkili tarama yöntemidir.',
    recommendation: 'USPSTF 2018 (hâlâ geçerli): 21–29 yaş: 3 yılda bir Pap smear. 30–65 yaş: 5 yılda bir HPV testi + Pap smear (ko-test) veya 3 yılda bir yalnızca Pap smear. 65 yaş üstü, yeterli önceki tarama öyküsü olan kadınlarda USPSTF taramaya karşı çıkıyor (Grade D). Not: ACS 2020 kılavuzu taramayı 25 yaşında başlatmayı önermektedir (USPSTF\'nin 21 yaş önerisinden farklı). 2024 USPSTF taslak güncellemesi (henüz kesinleşmedi): 30–65 yaş için HPV primer taramasını tercih edilen yöntem yapmayı ve kendi kendine örnek almayı (self-collection) eklemeyi önermektedir. HPV aşısı yaptırmak taramayı ortadan kaldırmaz.',
    frequencyMonths: 36, ageMin: 21, ageMax: 65, sex: 'F', weight: 3,
    doctor: 'Kadın Hastalıkları · Aile Hekimi · Tıbbi Onkoloji', icon: '🌸',
    sources: [
      { name: 'USPSTF — Cervical Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cervical-cancer-screening' },
      { name: 'ACS — Cervical Cancer Screening Guideline (2020)', url: 'https://acsjournals.onlinelibrary.wiley.com/doi/10.3322/caac.21628' },
    ],
  },

  akci_bt: {
    id: 'akci_bt', trName: 'Akciğer BT (Düşük Doz)', enName: 'Low-Dose CT — Lung Cancer',
    nameMedical: 'Düşük Doz Toraks Bilgisayarlı Tomografisi (LDCT)',
    why: 'Ağır sigara içicilerinde akciğer kanserini semptom oluşmadan önce erken tespit eder. Bu tarama akciğer kanseri ölümlerini %20 azaltır.',
    layer: 2,
    guideline: 'USPSTF 2021 Grade B',
    explanation: 'Ağır sigara içicilerinde akciğer kanserini erken tespit eder. Yüksek riskli grupta mortaliteyi %20 azaltır.',
    recommendation: '50–80 yaş arası, 20+ paket-yıl sigara içen veya son 15 yıl içinde bırakmış bireylere yılda bir düşük doz BT önerilir (USPSTF B).',
    frequencyMonths: 12, ageMin: 50, ageMax: 80, sex: 'both', weight: 3,
    doctor: 'Göğüs Hastalıkları · Radyoloji · Tıbbi Onkoloji', icon: '🫁',
    sources: [
      { name: 'USPSTF — Lung Cancer Screening (2021)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening' },
      { name: 'ESMO — Lung Cancer Screening Guidelines', url: 'https://www.esmo.org/guidelines/lung-cancer' },
    ],
  },

  goz_dibi: {
    id: 'goz_dibi', trName: 'Göz Dibi Muayenesi', enName: 'Dilated Fundus Examination',
    nameMedical: 'Fundoskopi / Retinal Muayene',
    why: 'Diyabet göz damarlarına zarar verebilir ve görme kaybına yol açabilir. Erken tespit ile tedavi körlüğü önler.',
    layer: 2,
    guideline: 'ADA Standart Bakım Kılavuzu 2025',
    explanation: 'Diyabetik retinopati ve hipertansif retinopatiyi erken tespit eder. Tedavi edilmezse körlüğe yol açabilir.',
    recommendation: 'Tip 2 diyabette tanı anında, Tip 1 diyabette tanıdan 5 yıl sonra göz dibi muayenesi yapılmalıdır. Retinopati yoksa yılda bir, bulgu varsa 3–6 ayda bir tekrar. ADA 2025 Bölüm 12 (Diabetes Care 2025;48:S252–S265) gebelik önerisi güncellendi: Göz muayenesi gebelikten ÖNCE VE birinci trimesterde yapılmalıdır (önceki "veya" ifadesinden "ve"ye geçildi); her trimesterde izlem ve doğum sonrası 1 yıl sürdürülmelidir. Gestasyonel diyabette göz dibi muayenesi gerekli değildir. AI destekli tarama (FDA onaylı algoritmalar, ör. IDx-DR) artık Grade B öneri kapsamındadır.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Göz Hastalıkları · Retina Uzmanı', icon: '👁️',
    sources: [
      { name: 'ADA — Retinopathy Screening (Standards of Care 2025, Bölüm 12; Diabetes Care 2025;48:S252–S265)', url: 'https://professional.diabetes.org/standards-of-care' },
      { name: 'AAO — Diabetic Retinopathy Guidelines', url: 'https://www.aao.org/preferred-practice-pattern/diabetic-retinopathy-pppp' },
    ],
  },

  dis_kontrol: {
    id: 'dis_kontrol', trName: 'Diş Kontrolü', enName: 'Dental Check-up',
    nameMedical: 'Diş ve Periodontal Muayene',
    why: 'Diş eti hastalığı diyabeti ve kalp hastalığını kötüleştirir. Düzenli kontrol hem ağız sağlığını hem genel sağlığı korur.',
    layer: 1,
    guideline: 'EFP 2022 Periodontal Kılavuzu',
    explanation: 'Diş çürükleri ve periodontal (diş eti) hastalıklarının erken tespiti. Periodontal hastalık kalp hastalığı ve diyabet kontrolünü olumsuz etkiler.',
    recommendation: 'Altı ayda bir diş hekimi kontrolü ve profesyonel temizlik önerilir. Diyabet hastalarında periodontal tedavi HbA1c\'yi düşürür.',
    frequencyMonths: 6, ageMin: 18, ageMax: 120, sex: 'both', weight: 1,
    doctor: 'Diş Hekimi · Periodontoloji Uzmanı', icon: '🦷',
    sources: [
      { name: 'ADA — Periodontal Disease and Diabetes (2022)', url: 'https://diabetesjournals.org/care/article/45/Supplement_1/S246/138907' },
      { name: 'EFP — European Periodontal Guidelines (2022)', url: 'https://www.efp.org/publications/clinical-guidelines/' },
    ],
  },

  prostat: {
    id: 'prostat', trName: 'Prostat Taraması (PSA)', enName: 'Prostate-Specific Antigen Screening',
    nameMedical: 'Prostat Spesifik Antijen (PSA) Testi',
    why: 'Prostat kanserini erken evrede tespit eder. Aile öyküsü olanlar daha genç yaşta başlayarak riski azaltabilir.',
    layer: 2,
    guideline: 'USPSTF 2018 Grade C / EAU 2024',
    explanation: 'PSA kan testi prostat kanseri riskini değerlendirmek için kullanılır. Yaşa göre normallik aralıkları değişir.',
    recommendation: 'USPSTF: 55–69 yaş paylaşımlı karar (Grade C); ≥70 yaş önerilmez. Uygulama "PSA yaptır" değil, "doktorunuzla tartışın" mesajı verir. ⚠️ AİLE ÖYKÜSÜ KURALLARI (ACS): Ortalama risk → 50 yaşında tartışma. Yüksek risk (siyahi erkek VEYA 65 yaş altında prostat kanseri olan 1 1. derece akraba) → 45 yaşında tartışma. En yüksek risk (65 yaş altında 1\'den fazla 1. derece akraba) → 40 yaşında tartışma. BRCA2 mutasyonu → 40 yaşında yıllık PSA (ESMO 2025 / NCCN).',
    frequencyMonths: 12, ageMin: 40, ageMax: 75, sex: 'M', weight: 3,
    doctor: 'Üroloji · Aile Hekimi · Tıbbi Onkoloji', icon: '🔵',
    sources: [
      { name: 'USPSTF — Prostate Cancer Screening (2018)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening' },
      { name: 'EAU — Prostate Cancer Guidelines (2024)', url: 'https://uroweb.org/guidelines/prostate-cancer' },
    ],
  },

  genetik_danisman: {
    id: 'genetik_danisman', trName: 'Genetik Danışmanlık (BRCA / Lynch)', enName: 'Genetic Counseling and Risk Assessment',
    nameMedical: 'Germline Genetik Test (BRCA1/2, Lynch Sendromu / MMR Genleri)',
    why: 'Ailede kanser öyküsü varsa genetik mutasyon taşıyıcısı olabilirsiniz. Erken tespit profilaktik cerrahi ve yoğun tarama ile kanseri önler.',
    layer: 2,
    guideline: 'USPSTF Grade B / NCCN 2024',
    explanation: 'Ailede meme, yumurtalık, kolorektal veya pankreas kanseri öyküsü olanlarda BRCA1/2 veya Lynch sendromu mutasyonu riski artmıştır. Genetik test sonucu profilaktik cerrahi kararını ve tarama yoğunluğunu doğrudan belirler.',
    recommendation: 'USPSTF Grade B: Ailede meme, yumurtalık, tüp veya periton kanseri öyküsü olan ya da yüksek riskli etnisiteden gelen kişilere (örn. Aşkenaz Yahudi kökeni) doğrulanmış aile riski değerlendirme aracıyla tarama yapılması ve pozitif sonuçta genetik danışmana yönlendirilmesi önerilir. NCCN: 50 yaş altı kolorektal kanser tanısı alan tüm bireylere aile öyküsünden bağımsız germline test önerilir. BRCA1/2 mutasyon taşıyıcılarında yumurtalık kanseri için prophylactic salpingo-ooferektomi (RRSO) en etkin korunma yöntemidir (BRCA1: 35-40 yaş, BRCA2: 40-45 yaş).',
    frequencyMonths: 999, ageMin: 18, ageMax: 120, sex: 'both', weight: 3,
    doctor: 'Tıbbi Genetik · Tıbbi Onkoloji · Kadın Hastalıkları · Gastroenteroloji', icon: '🧬',
    sources: [
      { name: 'USPSTF — BRCA Risk Assessment, Genetic Counseling, and Testing (Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/brca-related-cancer-risk-assessment-genetic-counseling-and-genetic-testing' },
      { name: 'NCCN — Hereditary Breast, Ovarian, Pancreatic and Prostate Cancers (HBOPP)', url: 'https://www.nccn.org/patients/guidelines/content/PDF/genetics-patient.pdf' },
      { name: 'ESMO — Risk Reduction and Screening in Hereditary Breast-Ovarian Cancer', url: 'https://www.researchgate.net/publication/364712474_Risk_reduction_and_screening_of_cancer_in_hereditary_breast-ovarian_cancer_syndromes_ESMO_Clinical_Practice_Guideline' },
    ],
  },

  // ── YENİ TARAMALAR ───────────────────────────────────────────────────────────
  tansiyon_olcumu: {
    id: 'tansiyon_olcumu', trName: 'Kan Basıncı Ölçümü', enName: 'Blood Pressure Screening',
    nameMedical: 'Arteriyel Kan Basıncı Ölçümü (Sfigmomanometri)',
    why: 'Hipertansiyon hiçbir belirti vermeden inme ve kalp krizine yol açabilir. Düzenli ölçüm ile erken tespit ve tedavi hayat kurtarır.',
    layer: 1,
    guideline: 'USPSTF 2021 Grade A / ESC/ESH 2023 Hipertansiyon Kılavuzu',
    explanation: 'Hipertansiyon erken belirtisiz seyreder; ölçüm tek tanı yoludur. Kontrolsüz hipertansiyon inme, kalp krizi ve böbrek hasarının başlıca nedenidir.',
    recommendation: 'USPSTF 2015 (2021\'de yeniden onaylandı) Grade A: 18 yaş üstü tüm yetişkinlerde ofis tansiyonu ölçümü. Yüksek değer saptandığında ambulatuar (24 saat) veya ev ölçümüyle doğrulama gerekir. 40 yaş üstü veya yüksek riskli (Siyahi yetişkin, yüksek-normal KB): yılda bir. 18–39 yaş normal KB ve risk faktörü yok: 3–5 yılda bir.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 3,
    doctor: 'Aile Hekimi · İç Hastalıkları · Kardiyoloji · Nefroloji · Endokrinoloji', icon: '🩺',
    sources: [
      { name: 'USPSTF — Hypertension Screening in Adults (2021, Grade A)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening' },
      { name: 'ESC/ESH — Hypertension Guidelines (2023)', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/2023-ESH-ESC-Guidelines-for-the-management-of-arterial-hypertension' },
    ],
  },

  depresyon_tarama: {
    id: 'depresyon_tarama', trName: 'Depresyon Taraması', enName: 'Depression Screening',
    nameMedical: 'PHQ-2/PHQ-9 Depresyon Tarama Ölçeği',
    why: 'Depresyon genellikle tanınmaz ve tedavi edilmez. Basit bir soru setiyle erken tespit ile tam iyileşme mümkündür.',
    layer: 1,
    guideline: 'USPSTF 2023 Grade B',
    explanation: 'Depresyon tüm dünyada önde gelen iş göremezlik nedenidir. PHQ-2 ve PHQ-9 araçları ile basit tarama hayat kurtarabilir.',
    recommendation: 'USPSTF 2023 Grade B: 19 yaş üstü tüm yetişkinlerde depresyon taraması; gebelik/doğum sonrası dönem ve ≥65 yaş dahil. Tarama aracı: PHQ-2 (ön tarama), pozitifse PHQ-9. Optimal aralık belirsiz; yılda bir önerilir. Kanıta dayalı tedavi (psikoterapi ve/veya ilaç) erişilebilir olmalıdır.',
    frequencyMonths: 12, ageMin: 19, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Psikiyatri · Klinik Psikolog', icon: '🧠',
    sources: [
      { name: 'USPSTF — Depression and Suicide Risk Screening in Adults (2023, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/depression-anxiety-and-suicide-risk-screening-adults' },
    ],
  },

  hiv_tarama: {
    id: 'hiv_tarama', trName: 'HIV Taraması', enName: 'HIV Screening',
    nameMedical: 'HIV-1/2 Antijen/Antikor Kombine Testi (4. Kuşak)',
    why: 'HIV yıllarca belirti vermeden ilerleyebilir. Erken tanı ile modern antiretroviral tedavi sayesinde normal yaşam süresi sağlanabilir.',
    layer: 1,
    guideline: 'USPSTF 2019 Grade A',
    explanation: 'HIV enfeksiyonu yıllarca belirtisiz seyredebilir. Erken tanı ile modern antiretroviral tedavi ile normal yaşam beklentisi sağlanabilir.',
    recommendation: 'USPSTF 2019 Grade A: 15–65 yaş arası tüm bireylere en az bir kez HIV taraması. Bu yaş dışında da yüksek risk varlığında tarama. Tüm gebelere her gebelikte. Yüksek riskli bireylere (yeni partner, enjeksiyon ilaç kullanımı) yılda bir tekrar. Test: kombine HIV-1/2 antijen/antikor testi (4. kuşak).',
    frequencyMonths: 999, ageMin: 15, ageMax: 65, sex: 'both', weight: 3,
    doctor: 'Aile Hekimi · Enfeksiyon Hastalıkları · İmmünoloji', icon: '🔴',
    sources: [
      { name: 'USPSTF — HIV Infection Screening (2019, Grade A)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/human-immunodeficiency-virus-hiv-infection-screening' },
      { name: 'CDC — HIV Testing Recommendations', url: 'https://www.cdc.gov/hiv/testing/index.html' },
    ],
  },

  aort_anevrizması: {
    id: 'aort_anevrizması', trName: 'Aort Anevrizması Taraması (AAA)', enName: 'Abdominal Aortic Aneurysm Screening',
    nameMedical: 'Karın Aortu Ultrasonografisi (AAA Taraması)',
    why: 'Aort anevrizması rüptüre kadar hiçbir belirti vermez. Rüptür mortalitesi %85\'i aşar; tarama ile cerrahi fırsat yakalanarak hayat kurtarılır.',
    layer: 2,
    guideline: 'USPSTF 2019 Grade B',
    explanation: 'Karın aortunun genişlemesi (≥3 cm) genellikle belirtisizdir. Rüptür mortalitesi %85\'i aşar; tarama ile cerrahi fırsat yakalanabilir.',
    recommendation: 'USPSTF 2019 Grade B: 65–75 yaş arası, hayatında ≥100 sigara içmiş (yaklaşık 5 paket-yıl) erkeklere tek seferlik karın ultrasonografisi ile AAA taraması. 65–75 yaş hiç sigara içmemiş erkekler: Grade C (seçici, bireysel karar). Kadınlar için yeterli kanıt yok (Grade I sigaralı; Grade D sigara içmemiş). Ultrasonda aort çapı: normal <3 cm; AAA ≥3 cm.',
    frequencyMonths: 999, ageMin: 65, ageMax: 75, sex: 'M', weight: 3,
    doctor: 'Vasküler Cerrahi · Radyoloji · Kardiyoloji', icon: '🫀',
    sources: [
      { name: 'USPSTF — Abdominal Aortic Aneurysm Screening (2019, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/abdominal-aortic-aneurysm-screening' },
    ],
  },

  // ── AŞILAR ──────────────────────────────────────────────────────────────────

  asi_grip: {
    id: 'asi_grip', trName: 'Grip Aşısı (İnfluenza)', enName: 'Influenza Vaccine',
    nameMedical: 'İnaktif İnfluenza Aşısı (IIV4)',
    why: 'Grip komplikasyonları (pnömoni, hastaneye yatış) önlenebilir. Her yıl virüs suşu değiştiği için yıllık aşı gerekir.',
    layer: 1, guideline: 'ACIP 2024-2025',
    explanation: 'Her yıl güncellenen grip virüsü suşlarına karşı yıllık aşı. Kronik hastalığı olanlarda hastaneye yatış riskini %40-60 azaltır.',
    recommendation: 'ACIP Grade A: ≥6 ay tüm bireyler için yıllık influenza aşısı. ≥65 yaş için yüksek doz (HD-IIV4) veya adjuvanlı (aIIV4) tercih edilir.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi', icon: '💉',
    sources: [{ name: 'ACIP — Influenza Vaccine Recommendations 2024-2025', url: 'https://www.cdc.gov/vaccines/hcp/acip-recs/general-recs/influenza.html' }],
  },

  asi_td_tdap: {
    id: 'asi_td_tdap', trName: 'Tetanos Takviye Aşısı (Td/Tdap)', enName: 'Tetanus Booster (Td/Tdap)',
    nameMedical: 'Tetanos-Difteri ± Boğmaca Aşısı (Td/Tdap)',
    why: 'Tetanos bağışıklığı 10 yılda azalır. Tdap aynı zamanda boğmacaya karşı da koruma sağlar.',
    layer: 1, guideline: 'ACIP Td/Tdap Tavsiyesi',
    explanation: 'Hayatında bir kez Tdap (boğmaca korumalı), ardından her 10 yılda bir Td hatırlatma dozası. Yaralanmada ≥5 yıl geçmişse ek doz.',
    recommendation: 'ACIP: Tüm yetişkinler için hayatında bir kez Tdap, ardından her 10 yılda bir Td booster. Gebelikte 27-36. haftada Tdap (her gebelikte).',
    frequencyMonths: 120, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi', icon: '💉',
    sources: [{ name: 'ACIP — Td/Tdap Recommendations', url: 'https://www.cdc.gov/vaccines/vpd/tetanus/hcp/recommendations.html' }],
  },

  asi_zona: {
    id: 'asi_zona', trName: 'Zona Aşısı (Shingrix)', enName: 'Herpes Zoster Vaccine (RZV)',
    nameMedical: 'Rekombinant Zoster Aşısı (Shingrix, RZV)',
    why: '50 yaş sonrası her 3 kişiden 1\'i zona geçirir. Postherpetik nevralji aylarca süren ağrı yaratabilir; aşı bu riski >90% azaltır.',
    layer: 2, guideline: 'ACIP 2022 Grade A',
    explanation: '2 doz seri (2-6 ay arayla). Önceki zona geçirenler ve Zostavax alanlara da uygulanır.',
    recommendation: 'ACIP Grade A: ≥50 yaş tüm yetişkinler, bağışıklık durumundan bağımsız. 2 doz: ilk doz ardından 2-6 ay sonra ikinci doz. İmmünsuprese hastalarda da güvenli.',
    frequencyMonths: 999, ageMin: 50, ageMax: 120, sex: 'both', weight: 3,
    doctor: 'Aile Hekimi · İç Hastalıkları', icon: '💉',
    sources: [{ name: 'ACIP — Recombinant Zoster Vaccine Recommendations (2022)', url: 'https://www.cdc.gov/vaccines/vpd/shingles/hcp/shingrix/recommendations.html' }],
  },

  asi_pnomoni: {
    id: 'asi_pnomoni', trName: 'Pnömokok Aşısı (PCV20)', enName: 'Pneumococcal Vaccine (PCV20)',
    nameMedical: 'Pnömokok Konjuge Aşısı 20-valanlı (PCV20)',
    why: 'Pnömokok pnömoni, menenjit ve sepsise yol açar. Kronik hastalık ve ≥65 yaşta ağır seyredebilir; aşı ciddi enfeksiyonu önler.',
    layer: 2, guideline: 'ACIP 2022 Pnömokok Tavsiyesi',
    explanation: 'Tek doz PCV20 veya PCV15+PPSV23 serisi. Kronik hastalıklarda (diyabet, kalp, karaciğer) ≥65 beklenmeden önerilir.',
    recommendation: 'ACIP 2022: ≥65 yaş için tek doz PCV20 (tercihli). 19-64 yaş; diyabet, kronik kalp/akciğer/karaciğer/böbrek hastalığı, sigara, immünsupresyon durumunda PCV20.',
    frequencyMonths: 999, ageMin: 19, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · İç Hastalıkları', icon: '💉',
    sources: [{ name: 'ACIP — Pneumococcal Vaccine Recommendations (2022)', url: 'https://www.cdc.gov/vaccines/vpd/pneumo/hcp/recommendations.html' }],
  },

  asi_hpv: {
    id: 'asi_hpv', trName: 'HPV Aşısı (Gardasil-9)', enName: 'HPV Vaccine (9vHPV)',
    nameMedical: '9-Valanlı HPV Aşısı (Gardasil-9)',
    why: 'HPV rahim ağzı, anüs, penis ve baş-boyun kanserlerinin en önemli nedenidir. Aşı bu kanserleri büyük ölçüde önler.',
    layer: 2, guideline: 'ACIP 2022 HPV Tavsiyesi',
    explanation: '≤26 yaş rutin (Grade A). 27-45 yaş paylaşımlı karar (Grade B). 2 doz (erken başlandıysa) veya 3 doz serisi.',
    recommendation: 'ACIP: ≤26 yaş için rutin 9vHPV aşısı. 27-45 yaş için daha önce aşılanmamış veya eksik seride paylaşımlı karar. HPV enfeksiyonu öyküsü dışlamaz.',
    frequencyMonths: 999, ageMin: 9, ageMax: 45, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Kadın Doğum', icon: '💉',
    sources: [{ name: 'ACIP — HPV Vaccine Recommendations (2022)', url: 'https://www.cdc.gov/vaccines/vpd/hpv/hcp/recommendations.html' }],
  },

  asi_hepatit_b: {
    id: 'asi_hepatit_b', trName: 'Hepatit B Aşısı', enName: 'Hepatitis B Vaccine',
    nameMedical: 'Rekombinant Hepatit B Aşısı (Heplisav-B / Engerix-B)',
    why: 'Hepatit B kronik enfeksiyona, karaciğer sirozuna ve karaciğer kanserine yol açabilir. Aşılanmamış yetişkinlerde seri tamamlanması önerilir.',
    layer: 2, guideline: 'ACIP 2022 Hepatit B Tavsiyesi',
    explanation: '2-doz Heplisav-B veya 3-doz klasik seri. ACIP 2022 güncellemesiyle ≤59 yaş tüm yetişkinlere rutin önerilmektedir.',
    recommendation: 'ACIP 2022: ≤59 yaş tüm yetişkinler için rutin HepB aşısı. ≥60 yaş: kronik hastalık, sağlık personeli, seyahat durumunda önerilir. Heplisav-B (2 doz, 1 ay ara) veya klasik 3-doz serisi.',
    frequencyMonths: 999, ageMin: 18, ageMax: 60, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · Gastroenteroloji', icon: '💉',
    sources: [{ name: 'ACIP — Hepatitis B Vaccination of Adults (2022)', url: 'https://www.cdc.gov/vaccines/vpd/hepb/hcp/recommendations.html' }],
  },

  obezite_tarama: {
    id: 'obezite_tarama', trName: 'Obezite / BMI Taraması', enName: 'Obesity and BMI Screening',
    nameMedical: 'Vücut Kitle İndeksi (VKİ/BMI) Değerlendirmesi',
    why: 'Obezite diyabet, kalp hastalığı ve kanserin en önemli önlenebilir risk faktörüdür. BMI takibi hedefli müdahale ve takip sağlar.',
    layer: 1,
    guideline: 'USPSTF 2018 Grade B',
    explanation: 'BMI ölçümü ile obezite (BMI ≥30) ve fazla kilo (BMI 25–29.9) saptanır. Obezite diyabet, kalp hastalığı, kanser ve eklem hastalıklarının en önemli önlenebilir risk faktörüdür.',
    recommendation: 'USPSTF 2018 Grade B: Tüm yetişkinlerde obezite taraması. BMI ≥30 olan yetişkinlere yoğun, çok bileşenli davranışsal müdahale (ilk yılda ≥12 seans) sunulması veya yönlendirilmesi. BMI formülü: kilo (kg) / boy² (m). Sınırlar: <18.5 zayıf; 18.5–24.9 normal; 25–29.9 fazla kilolu; ≥30 obez.',
    frequencyMonths: 12, ageMin: 18, ageMax: 120, sex: 'both', weight: 2,
    doctor: 'Aile Hekimi · İç Hastalıkları · Endokrinoloji · Bariatrik Cerrahi', icon: '⚖️',
    sources: [
      { name: 'USPSTF — Weight Loss to Prevent Obesity-Related Morbidity and Mortality in Adults (2018, Grade B)', url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/obesity-in-adults-interventions' },
    ],
  },
}

// ── DISEASE → SCREENING MAPPING ─────────────────────────────────────────────
export const DISEASE_SCREENINGS = {

  healthy: {
    // Yalnızca USPSTF Grade A/B veya eşdeğer ESC/ADA kılavuz desteği olan taramalar
    label: 'Sağlıklı', screenings: [
      { id: 'tansiyon_olcumu', months: 12 },  // USPSTF Grade A — 18 yaş üstü tüm yetişkinler
      { id: 'obezite_tarama', months: 12 },   // USPSTF Grade B — tüm yetişkinler
      { id: 'lipid', months: 60 },            // ESC/AHA her 4–6 yılda bir
      { id: 'biyokimya', months: 60 },        // ESC 2021: CVD risk paneli, 5 yılda bir
      { id: 'hepatit', months: 999 },         // USPSTF Grade B — hayatında bir kez
      { id: 'hiv_tarama', months: 999 },      // USPSTF Grade A — hayatında bir kez
      { id: 'depresyon_tarama', months: 12 }, // USPSTF Grade B — tüm yetişkinler
      { id: 'kolonoskopi', months: 120 },     // USPSTF Grade A (50–75), Grade B (45–49)
      { id: 'mamografi', months: 24 },        // USPSTF Grade B — 40–74 kadın
      { id: 'pap_smear', months: 36 },        // USPSTF Grade A — 21–65 kadın
      { id: 'dexa', months: 24 },             // USPSTF Grade B — 65+ kadın
      { id: 'prostat', months: 24 },          // USPSTF Grade C — 55–69 erkek (paylaşımlı karar)
      { id: 'aort_anevrizması', months: 999 }, // USPSTF Grade B — 65–75 yaş sigara içen erkek
      // ── Aşılar ──
      { id: 'asi_grip', months: 12 },         // ACIP Grade A — tüm yetişkinler, yılda bir
      { id: 'asi_td_tdap', months: 120 },     // ACIP — hayatında bir Tdap, sonra 10 yılda bir Td
      { id: 'asi_hpv', months: 999 },         // ACIP Grade A ≤26, Grade B 27-45 (engine ageMax:45)
      { id: 'asi_hepatit_b', months: 999 },   // ACIP 2022 — ≤59 yaş rutin (engine ageMax:60)
    ]
  },

  hipertansiyon: {
    // AHA/ACC 2025 Hypertension Guideline — zorunlu başlangıç paneli
    label: 'Yüksek Tansiyon',
    screenings: [
      { id: 'tansiyon_olcumu', months: 6 },    // AHA/ACC 2025: zorunlu izlem
      { id: 'depresyon_tarama', months: 12 },   // USPSTF Grade B
      { id: 'kan_sayimi', months: 6 },          // AHA/ACC 2025: başlangıç paneli — zorunlu
      { id: 'biyokimya', months: 6 },           // AHA/ACC 2025: elektrolit, kreatinin, eGFR
      { id: 'lipid', months: 6 },               // AHA/ACC 2025: PREVENT™ risk hesabı için
      { id: 'tsh', months: 12 },                // AHA/ACC 2025: sekonder HTN tarama paneli — yeni eklendi
      { id: 'idrar', months: 6 },               // AHA/ACC 2025: UACR artık zorunlu (2017'de opsiyoneldi)
      { id: 'ekg', months: 12 },                // ESC 2021: LVH tespiti
      { id: 'ekokardiyografi', months: 24 },    // ESC/ESH 2023: hedef organ hasarı
      { id: 'karotis_usg', months: 24 },        // ESC 2021: plak değerlendirmesi (IIb)
      { id: 'goz_dibi', months: 12 },           // Hipertansif retinopati
    ]
  },

  diyabet: {
    label: 'Diyabet',
    screenings: [
      { id: 'tansiyon_olcumu', months: 6 },
      { id: 'depresyon_tarama', months: 12 },
      { id: 'obezite_tarama', months: 12 },
      { id: 'hba1c', months: 3 },
      { id: 'biyokimya', months: 3 },
      { id: 'lipid', months: 6 },
      { id: 'idrar', months: 6 },
      { id: 'goz_dibi', months: 12 },
      { id: 'ekg', months: 12 },
      { id: 'vitamin_d', months: 12 },
      { id: 'b12', months: 12 },
      { id: 'dis_kontrol', months: 6 },
      { id: 'asi_pnomoni', months: 999 },  // ACIP 2022: diyabette PCV20 (19-64 yaş dahil)
      { id: 'asi_grip', months: 12 },      // ACIP: diyabette grip komplikasyon riski yüksek
    ]
  },

  // prediyabet kaldırıldı — bu hastalar artık 'diyabet' grubunu seçmeli (Cem 07.03.2026)

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
      { id: 'tansiyon_olcumu', months: 6 },
      { id: 'depresyon_tarama', months: 12 },
      { id: 'obezite_tarama', months: 12 },
      { id: 'lipid', months: 6 },
      { id: 'hba1c', months: 6 },
      { id: 'biyokimya', months: 6 },
      { id: 'karin_usg', months: 12 },
      { id: 'fibroscan', months: 12 },
      { id: 'ekg', months: 24 },
      { id: 'vitamin_d', months: 12 },
      { id: 'tsh', months: 12 },
      { id: 'asi_pnomoni', months: 999 },  // ACIP 2022: obezite (BMI≥40) pnömokok endikasyonu
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
      { id: 'asi_hepatit_b', months: 999 }, // EASL 2024: karaciğer hastasında HepB aşısı zorunlu
    ]
  },

  kalp_damar: {
    label: 'Kalp Damar Hastalığı',
    screenings: [
      { id: 'tansiyon_olcumu', months: 3 },
      { id: 'depresyon_tarama', months: 12 },
      { id: 'ekg', months: 12 },
      { id: 'ekokardiyografi', months: 12 },
      { id: 'lipid', months: 6 },
      { id: 'karotis_usg', months: 12 },
      { id: 'biyokimya', months: 6 },
      { id: 'asi_pnomoni', months: 999 },  // ACIP 2022: kronik kalp hastalığında PCV20
      { id: 'asi_grip', months: 12 },      // AHA: kardiyovasküler hastalıkta yıllık grip aşısı
    ]
  },

  kemik_erimesi: {
    label: 'Kemik Erimesi',
    screenings: [
      { id: 'dexa', months: 24 },
      { id: 'vitamin_d', months: 6 },
      { id: 'biyokimya', months: 12 },
    ]
  },

  // tiroid kaldırıldı — USPSTF Grade I, uygulama kapsamı dışı (Cem 07.03.2026)

  // ── AİLEDE KANSER ÖYKÜSÜ — kanser türü ve akrabalık derecesine göre ────────

  aile_meme_yuksek: {
    // 1. derece akraba, 50 yaş altı meme kanseri — YÜKSEK RİSK
    // ACS/NCCN: yıllık mamografi + yıllık MRI, 30 yaşında başla (veya tanıdan 10 yıl önce)
    label: 'Ailede Meme Kanseri (Yüksek Risk)',
    screenings: [
      { id: 'genetik_danisman', months: 999 },   // USPSTF Grade B — BRCA değerlendirmesi zorunlu
      { id: 'mamografi', months: 12 },            // ACS/NCCN: yılda bir (biennial değil)
      { id: 'kan_sayimi', months: 12 },
    ]
  },

  aile_meme_orta: {
    // 1. derece akraba, 50 yaş ve üstü meme kanseri — ORTA RİSK
    // ACS: yıllık mamografi 40 yaşından itibaren (ortalama riskten daha erken)
    label: 'Ailede Meme Kanseri (Orta Risk)',
    screenings: [
      { id: 'genetik_danisman', months: 999 },   // USPSTF Grade B
      { id: 'mamografi', months: 12 },            // ACS: yıllık (USPSTF 2 yıllık yerine)
    ]
  },

  aile_krc_yuksek: {
    // 1. derece akraba <60 yaşında KRK VEYA ≥2 birinci derece akraba — YÜKSEK RİSK
    // NCCN/ACS: 40 yaşında başla veya tanıdan 10 yıl önce; her 5 yılda bir kolonoskopi
    label: 'Ailede Kolorektal Kanser (Yüksek Risk)',
    screenings: [
      { id: 'genetik_danisman', months: 999 },   // Lynch sendromu / FAP dışlaması için
      { id: 'kolonoskopi', months: 60 },          // 5 yılda bir (ortalama 10 değil)
      { id: 'kan_sayimi', months: 12 },
    ]
  },

  aile_krc_orta: {
    // 1. derece akraba ≥60 yaşında KRK — ORTA RİSK
    // NCCN: 40 yaşında başla, 10 yılda bir kolonoskopi
    label: 'Ailede Kolorektal Kanser (Orta Risk)',
    screenings: [
      { id: 'kolonoskopi', months: 120 },         // 10 yılda bir ama 40 yaşında başla
      { id: 'kan_sayimi', months: 12 },
    ]
  },

  aile_krc_dusuk: {
    // 2. derece akraba (büyükanne/büyükbaba/hala/teyze/dayı/amca) — DÜŞÜK-ORTA RİSK
    // Kılavuzlar: 45 yaşında ortalama risk protokolü (2. derece için başlangıç yaşı değişmez)
    label: 'Ailede Kolorektal Kanser (Düşük-Orta Risk)',
    screenings: [
      { id: 'kolonoskopi', months: 120 },         // Ortalama risk gibi — 45 yaşında başla
    ]
  },

  aile_prostat: {
    // 1. derece akraba 65 yaş altında prostat kanseri — ACS yüksek risk
    // ACS: 45 yaşında PSA tartışması başlatılmalı
    label: 'Ailede Prostat Kanseri (Yüksek Risk)',
    screenings: [
      { id: 'prostat', months: 12 },              // ACS: 45 yaşında tartışma, yıllık izlem
      { id: 'genetik_danisman', months: 999 },    // BRCA2 dışlaması için
    ]
  },

  aile_yumurtalik: {
    // Ailede yumurtalık kanseri — USPSTF Grade D genel popülasyon için
    // BRCA değerlendirmesi zorunlu; RRSO tek kanıtlanmış korunma yöntemi
    label: 'Ailede Yumurtalık Kanseri',
    screenings: [
      { id: 'genetik_danisman', months: 999 },    // ACİL — BRCA/RRSO kararı için
      { id: 'mamografi', months: 12 },            // BRCA riski yüksek olduğundan meme taraması da
    ]
  },

  brca_lynch: {
    // Bilinen BRCA1/2 mutasyonu veya Lynch sendromu
    // En yoğun tarama protokolü
    label: 'BRCA/Lynch Sendromu',
    screenings: [
      { id: 'genetik_danisman', months: 60 },     // Periyodik genetik takip
      { id: 'mamografi', months: 12 },            // ACS/NCCN: yıllık, 30 yaşından
      { id: 'kolonoskopi', months: 24 },          // Lynch: her 1-2 yılda bir, 20-25 yaşından
      { id: 'prostat', months: 12 },              // BRCA2 erkekler: 40 yaşında yıllık PSA
      { id: 'kan_sayimi', months: 12 },
    ]
  },
}

// ── AVAILABLE DISEASES (for onboarding selection) ───────────────────────────
export const DISEASE_LIST = [
  { id: 'hipertansiyon',       label: 'Yüksek Tansiyon',       icon: '🫀' },
  { id: 'diyabet',             label: 'Diyabet',               icon: '🍬' },
  { id: 'hiperlipidemi',       label: 'Yüksek Kolesterol',     icon: '🩸' },
  { id: 'obezite',             label: 'Aşırı Kilo / Obezite',  icon: '⚖️' },
  { id: 'yagli_karaciger',     label: 'Yağlı Karaciğer',      icon: '🫘' },
  { id: 'kalp_damar',          label: 'Kalp Damar Hastalığı',  icon: '❤️' },
  { id: 'kemik_erimesi',       label: 'Kemik Erimesi',         icon: '🦴' },
  // ── Ailede Kanser Öyküsü (grouped under a header in onboarding) ──
  { id: 'aile_meme_yuksek',    label: 'Meme Kanseri — 1. derece akraba (50 yaş altında)', icon: '🩷', group: 'kanser' },
  { id: 'aile_meme_orta',      label: 'Meme Kanseri — 1. derece akraba (50 yaş ve üstü)', icon: '🩷', group: 'kanser' },
  { id: 'aile_krc_yuksek',     label: 'Kolorektal Kanser — 1. derece akraba (60 yaş altında) veya 2+ akraba', icon: '🟠', group: 'kanser' },
  { id: 'aile_krc_orta',       label: 'Kolorektal Kanser — 1. derece akraba (60 yaş ve üstü)', icon: '🟠', group: 'kanser' },
  { id: 'aile_krc_dusuk',      label: 'Kolorektal Kanser — 2. derece akraba', icon: '🟡', group: 'kanser' },
  { id: 'aile_prostat',        label: 'Prostat Kanseri — 1. derece akraba (65 yaş altında)', icon: '🔵', group: 'kanser' },
  { id: 'aile_yumurtalik',     label: 'Yumurtalık Kanseri — herhangi bir akraba', icon: '🟣', group: 'kanser' },
  { id: 'brca_lynch',          label: 'BRCA1/2 Mutasyonu veya Lynch Sendromu', icon: '🧬', group: 'kanser' },
]

// ── DOKTOR VİZİTİ → OTOMATİK TARAMA PAKETLERİ (Kontrole Gittim için) ─────
export const DOCTOR_SCREENING_MAP = {
  'Dahiliye / İç Hastalıkları': ['tansiyon_olcumu', 'kan_sayimi', 'biyokimya', 'lipid', 'hba1c', 'idrar', 'obezite_tarama'],
  'Aile Hekimi': ['tansiyon_olcumu', 'kan_sayimi', 'biyokimya', 'lipid', 'hepatit', 'depresyon_tarama'],
  'Kardiyoloji': ['ekg', 'ekokardiyografi', 'tansiyon_olcumu', 'lipid', 'karotis_usg'],
  'Endokrinoloji': ['hba1c', 'tsh', 'vitamin_d', 'biyokimya', 'obezite_tarama'],
  'Gastroenteroloji': ['kolonoskopi', 'karin_usg', 'fibroscan', 'hepatit'],
  'Göz Hastalıkları': ['goz_dibi'],
  'Kadın Hastalıkları': ['mamografi', 'pap_smear'],
  'Üroloji': ['prostat'],
  'Ortopedi / Romatoloji': ['dexa'],
  'Nefroloji': ['idrar', 'biyokimya', 'tansiyon_olcumu'],
  'Tıbbi Genetik': ['genetik_danisman'],
  'Psikiyatri': ['depresyon_tarama'],
  'Diş Hekimi': ['dis_kontrol'],
  'Göğüs Hastalıkları': ['akci_bt'],
  'Vasküler Cerrahi': ['karotis_usg', 'aort_anevrizması'],
}

// ── HASTALIK BAZLI DOKTOR KONTROL TAKVİMİ ────────────────────────────────────
// Her hastalık için: hangi doktor, kaç ayda bir, ziyarette ne yapılır, erken gitme durumları
export const DISEASE_DOCTOR_SCHEDULE = {

  hipertansiyon: [
    {
      id: 'htn_aile',
      doctor: 'Aile Hekimi / Dahiliye',
      intervalMonths: 3,
      purpose: 'Tansiyon ölçümü, ilaç değerlendirmesi, böbrek fonksiyon testi',
      screenings: ['tansiyon_olcumu', 'biyokimya', 'idrar'],
      earlyTriggers: [
        'Tansiyon sürekli >140/90 mmHg (ilaçta rağmen)',
        'Yeni baş ağrısı, görme bozukluğu, çarpıntı',
        'Bacak şişmesi veya ani kilo artışı',
      ],
      guideline: 'ESC/ESH Hipertansiyon Kılavuzu 2023',
    },
    {
      id: 'htn_kardiyoloji',
      doctor: 'Kardiyoloji',
      intervalMonths: 12,
      purpose: 'EKG, ekokardiyografi, kardiyovasküler risk değerlendirmesi',
      screenings: ['ekg', 'ekokardiyografi', 'lipid'],
      earlyTriggers: [
        'Göğüs ağrısı veya nefes darlığı',
        'Çarpıntı veya bayılma hissi',
      ],
      guideline: 'ESC/ESH Hipertansiyon Kılavuzu 2023',
    },
  ],

  diyabet: [
    {
      id: 'dm_dahiliye',
      doctor: 'Dahiliye / Endokrinoloji',
      intervalMonths: 3,
      purpose: 'HbA1c, ilaç dozajı gözden geçirme, ayak muayenesi, beslenme değerlendirmesi',
      screenings: ['hba1c', 'biyokimya', 'tansiyon_olcumu', 'idrar'],
      earlyTriggers: [
        'HbA1c >8% (kan şekeri kontrolden çıkmış)',
        'Sık hipoglisemi (kan şekeri düşme) atakları',
        'Ayakta yara veya uyuşma',
        'Bulantı, kusma, iştahsızlık (ketoz riski)',
      ],
      guideline: 'ADA Standart Bakım Kılavuzu 2025',
    },
    {
      id: 'dm_goz',
      doctor: 'Göz Hastalıkları (Oftalmoloji)',
      intervalMonths: 12,
      purpose: 'Göz dibi muayenesi (fundoskopi) — diyabetik retinopati taraması',
      screenings: ['goz_dibi'],
      earlyTriggers: [
        'Görme bulanıklığı veya ani görme kaybı',
        'Işık çakması, göz önünde uçuşan noktalar',
      ],
      guideline: 'ADA Standart Bakım Kılavuzu 2025, Bölüm 12',
    },
    {
      id: 'dm_nefroloji',
      doctor: 'Nefroloji',
      intervalMonths: 12,
      purpose: 'İdrar albumin/kreatinin oranı (UACR), eGFR böbrek filtrasyonu',
      screenings: ['idrar', 'biyokimya'],
      earlyTriggers: [
        'UACR değerinde artış (önceki sonuçtan belirgin yüksek)',
        'Bacak ve yüzde şişme (ödem)',
        'eGFR düşüşü',
      ],
      guideline: 'ADA Standart Bakım Kılavuzu 2025, Bölüm 11',
    },
    {
      id: 'dm_dis',
      doctor: 'Diş Hekimi',
      intervalMonths: 6,
      purpose: 'Periodontal (diş eti) muayene — diyabet diş eti hastalığı riskini artırır',
      screenings: ['dis_kontrol'],
      earlyTriggers: [
        'Diş eti kanaması veya şişmesi',
        'Diş ağrısı veya sallanma',
      ],
      guideline: 'ADA Periodontal Hastalık ve Diyabet 2022',
    },
  ],

  hiperlipidemi: [
    {
      id: 'lip_dahiliye',
      doctor: 'Dahiliye / Kardiyoloji',
      intervalMonths: 6,
      purpose: 'Lipid paneli, statin yan etki değerlendirmesi (karaciğer, kas enzimleri)',
      screenings: ['lipid', 'biyokimya'],
      earlyTriggers: [
        'Kas ağrısı veya güçsüzlük (statin yan etkisi olabilir)',
        'Sarılık veya koyu idrar (karaciğer)',
        'LDL hedefe ulaşılamıyorsa',
      ],
      guideline: 'ESC/EAS Dislipidemi Kılavuzu 2019 + 2025 Güncelleme',
    },
  ],

  obezite: [
    {
      id: 'obz_dahiliye',
      doctor: 'Dahiliye / Obezite Kliniği',
      intervalMonths: 3,
      purpose: 'BMI ve bel çevresi, metabolik panel, tedavi planı değerlendirmesi',
      screenings: ['obezite_tarama', 'biyokimya', 'lipid', 'hba1c', 'tansiyon_olcumu'],
      earlyTriggers: [
        'Kilo artışı devam ediyor veya hızlandı',
        'Yeni uyku apnesi belirtileri (horlama, gündüz uyuma)',
        'Eklem ağrısı yürümeyi zorlaştırıyor',
      ],
      guideline: 'AACE/OMA Obezite Kılavuzu 2025',
    },
  ],

  yagli_karaciger: [
    {
      id: 'ykc_gastro',
      doctor: 'Gastroenteroloji / Hepatoloji',
      intervalMonths: 6,
      purpose: 'Karaciğer enzimleri, FIB-4 skoru, fibrozis takibi, karın ultrasonografisi',
      screenings: ['biyokimya', 'karin_usg', 'fibroscan'],
      earlyTriggers: [
        'Sağ üst karın ağrısı veya hassasiyeti',
        'Sarılık, koyu idrar, açık renkli dışkı',
        'FIB-4 >2.67 (fibrozis riski yüksek)',
        'ALT/AST değerlerinde belirgin artış',
      ],
      guideline: 'EASL-EASD-EASO MASLD Kılavuzu 2024',
    },
  ],

  kalp_damar: [
    {
      id: 'kvh_kardiyoloji',
      doctor: 'Kardiyoloji',
      intervalMonths: 6,
      purpose: 'EKG, ekokardiyografi, lipid paneli, ilaç değerlendirmesi',
      screenings: ['ekg', 'ekokardiyografi', 'lipid', 'tansiyon_olcumu'],
      earlyTriggers: [
        'Göğüs ağrısı veya baskı hissi',
        'Nefes darlığı (özellikle yatarken)',
        'Çarpıntı, baygınlık veya bayılma',
        'Bacaklarda ani şişme',
      ],
      guideline: 'ESC Kardiyovasküler Hastalık Önleme Kılavuzu 2021',
    },
  ],

  kemik_erimesi: [
    {
      id: 'kem_endokrin',
      doctor: 'Endokrinoloji / Romatoloji',
      intervalMonths: 12,
      purpose: 'DEXA kemik yoğunluğu, D vitamini, kalsiyum değerlendirmesi',
      screenings: ['dexa', 'vitamin_d', 'biyokimya'],
      earlyTriggers: [
        'Düşme veya düşük enerjili kırık (kolayca kırık)',
        'Bel veya sırt ağrısında ani artış',
        'Boy kısalması',
      ],
      guideline: 'IOF + USPSTF Osteoporoz Kılavuzu 2025',
    },
  ],

  // Sağlıklı bireyler için genel kontrol
  healthy: [
    {
      id: 'healthy_aile',
      doctor: 'Aile Hekimi',
      intervalMonths: 12,
      purpose: 'Yıllık genel kontrol: tansiyon, BMI, kan testleri, aşı durumu',
      screenings: ['tansiyon_olcumu', 'lipid', 'biyokimya', 'hepatit'],
      earlyTriggers: [
        'Yeni başlayan semptomlar',
        'Aile öyküsünde önemli değişiklik',
      ],
      guideline: 'USPSTF Preventive Services Recommendations 2025',
    },
  ],
}
