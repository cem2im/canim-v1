export default function Disclaimer() {
  return (
    <div className="mx-5 mb-8 px-4 py-4 rounded-2xl"
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
          Bu uygulama, güncel tıp kılavuzlarına dayanılarak hazırlanmış{' '}
          <strong style={{ color: '#475569' }}>kişiselleştirilmiş bir tarama hatırlatma aracıdır.</strong>{' '}
          Tıbbi tanı, tedavi veya bireysel öneri niteliği taşımamaktadır.
          Tarama sonuçlarınızı ve sağlık kararlarınızı lütfen doktorunuzla birlikte değerlendirin.
        </p>
      </div>
      <p className="text-xs text-center mt-3" style={{ color: '#94a3b8' }}>
        Prof. Dr. Cem Şimşek • Hacettepe Üniversitesi
      </p>
    </div>
  )
}
