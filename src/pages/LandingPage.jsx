export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{background:'#FAFAF8'}}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="relative px-6 pt-14 pb-10 overflow-hidden"
        style={{background:'linear-gradient(160deg, #0D7377 0%, #14919B 60%, #1ab3bf 100%)'}}>
        {/* decorative circles */}
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full opacity-10 bg-white"/>
        <div className="absolute -left-8 bottom-0 w-36 h-36 rounded-full opacity-10 bg-white"/>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-2xl"
            style={{background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'2px solid rgba(255,255,255,0.3)'}}>
            <span className="text-white text-4xl font-black">C</span>
          </div>
          <div className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-1">Canım</div>
          <h1 className="text-white text-3xl font-extrabold leading-tight mb-4">
            Taramalarını<br/>Asla Kaçırma
          </h1>
          <p className="text-white/80 text-base leading-relaxed max-w-xs">
            Yaşın, cinsiyetin ve hastalıklarına göre hangi taramaları ne zaman yaptırman gerektiğini gösteren, <strong className="text-white">kılavuz destekli</strong> kişisel sağlık asistanın.
          </p>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-5">Neden Canım?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon:'🎯', title:'Kişiselleştirilmiş', desc:'Yaşın, cinsiyetin ve hastalıklarına özel tarama takvimi' },
            { icon:'📋', title:'Kılavuz Destekli', desc:'USPSTF, ESC, ADA, GOLD kılavuzlarına göre hazırlanmış' },
            { icon:'🔒', title:'Gizlilik Önce', desc:'Veriler yalnızca cihazında saklanır. Kayıt zorunlu değil' },
            { icon:'💉', title:'Kapsamlı Kapsam', desc:'Taramalar, aşılar, doktor ziyaretleri tek ekranda' },
          ].map(f => (
            <div key={f.title} className="p-4 rounded-2xl bg-white border border-gray-100"
              style={{boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-900 text-sm mb-1">{f.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <div className="px-5 pb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-5">Nasıl Çalışır?</p>
        <div className="space-y-3">
          {[
            { step:'1', title:'Profilini Oluştur', desc:'Yaşın, cinsiyetin ve varsa hastalıklarını gir — 2 dakika yeter.', color:'#0D7377' },
            { step:'2', title:'Planını Gör',       desc:'Sana özel tarama, aşı ve doktor ziyaret takvimine bak.', color:'#14919B' },
            { step:'3', title:'Takibi Yap',        desc:'Kontrole her gittiğinde kaydet, uyum puanını yükselt.', color:'#0f8a8f' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-4 px-4 py-4 rounded-2xl bg-white border border-gray-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{background:s.color}}>
                {s.step}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{s.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BADGE ────────────────────────────────────────────────────────────── */}
      <div className="mx-5 mb-6 px-4 py-3 rounded-2xl flex items-center gap-3"
        style={{background:'linear-gradient(135deg,#f0fafa,#e8f4f5)', border:'1px solid #b2dfdb'}}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{background:'#0D7377'}}>
          <span className="text-white text-lg font-black">C</span>
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Prof. Dr. Cem Şimşek</div>
          <div className="text-xs text-gray-500">Hacettepe Üniversitesi · Gastroenteroloji</div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-10 mt-auto">
        <button
          onClick={onStart}
          className="w-full py-5 rounded-2xl text-white font-extrabold text-lg active:scale-98 transition-all shadow-lg"
          style={{background:'linear-gradient(135deg, #0D7377, #14919B)'}}
        >
          Başla →
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          Ücretsiz · Kayıt zorunlu değil · Reklamsız
        </p>
      </div>
    </div>
  )
}
