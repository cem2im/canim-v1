export const LIFESTYLE_QUESTIONS = [
  {
    id: 'hareket', icon: '🏃', pillar: 'Hareket',
    question: 'Haftada kaç gün aktif egzersiz yapıyorsunuz?',
    opts: [
      { value: 'none',  label: '🛋️ Hiç',    score: 10 },
      { value: 'low',   label: '🚶 1-2 gün', score: 40 },
      { value: 'mid',   label: '🏃 3-4 gün', score: 75 },
      { value: 'high',  label: '💪 5+ gün',  score: 100 },
    ],
  },
  {
    id: 'uyku', icon: '😴', pillar: 'Uyku',
    question: 'Geceleri ortalama kaç saat uyuyorsunuz?',
    opts: [
      { value: 'very_low', label: '⚠️ 5h altı',  score: 20 },
      { value: 'low',      label: '🌙 5-6 saat',  score: 55 },
      { value: 'ok',       label: '✅ 7-8 saat',  score: 100 },
      { value: 'high',     label: '😪 9h üzeri',  score: 65 },
    ],
  },
  {
    id: 'beslenme', icon: '🥗', pillar: 'Beslenme',
    question: 'Beslenmenizi nasıl tanımlarsınız?',
    opts: [
      { value: 'processed', label: '🍔 İşlenmiş',  score: 20 },
      { value: 'unknown',   label: '🤷 Bilmiyorum', score: 40 },
      { value: 'mixed',     label: '🍽️ Karışık',   score: 65 },
      { value: 'healthy',   label: '🥗 Sağlıklı',  score: 100 },
    ],
  },
  {
    id: 'zihin', icon: '🧠', pillar: 'Zihin',
    question: 'Son 1 ayda kendinizi nasıl hissettiniz?',
    opts: [
      { value: 'overwhelmed', label: '😢 Bunalmış',         score: 10 },
      { value: 'stressed',    label: '😔 Stresli / Yorgun', score: 35 },
      { value: 'mixed',       label: '😐 Değişken',         score: 65 },
      { value: 'good',        label: '😊 İyi / Enerjik',    score: 100 },
    ],
  },
]

export function computeRadarAxes(cards, lifestyleAnswers) {
  const taramalarScore = cards.length > 0
    ? Math.round((cards.filter(c => c.status === 'ok' || c.status === 'soon').length / cards.length) * 100)
    : 0

  const lifeAxes = LIFESTYLE_QUESTIONS.map(q => {
    const val = lifestyleAnswers[q.id]
    const opt = q.opts.find(o => o.value === val)
    return { label: q.pillar, icon: q.icon, score: opt ? opt.score : 0 }
  })

  return [{ label: 'Taramalar', icon: '🔬', score: taramalarScore }, ...lifeAxes]
}

export function computeGrade(score) {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function gradeColor(score) {
  if (score >= 70) return '#059669'
  if (score >= 55) return '#D97706'
  return '#DC2626'
}
