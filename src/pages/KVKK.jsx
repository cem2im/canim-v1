export default function KVKKPage({ page, onBack }) {
  const pages = {
    gizlilik: {
      title: 'Gizlilik Politikası',
      content: [
        'Canım uygulaması, sağlık verilerinizin gizliliğini en üst düzeyde korur.',
        'Tüm verileriniz yalnızca cihazınızda saklanır. Hiçbir sunucuya gönderilmez, üçüncü taraflarla paylaşılmaz.',
        'İnternet bağlantısı gerektirmeyen bu uygulama, çevrimdışı çalışmak üzere tasarlanmıştır.',
        'Verilerinizi dilediğiniz zaman Profil → Taramalarımı Sıfırla seçeneği ile silebilirsiniz.',
        'Uygulamayı kaldırdığınızda tüm veriler otomatik olarak silinir.',
      ]
    },
    kvkk: {
      title: 'KVKK Aydınlatma Metni',
      content: [
        '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metnidir.',
        'Veri Sorumlusu: Dr. Cem Şimşek',
        'İşlenen Kişisel Veriler: Bu uygulama kişisel veri işlememektedir. Girdiğiniz tüm bilgiler (doğum yılı, sağlık durumu, tarama tarihleri) yalnızca cihazınızın yerel depolama alanında tutulur.',
        'Veri Aktarımı: Herhangi bir sunucuya ya da üçüncü tarafa veri aktarımı yapılmamaktadır.',
        'Haklarınız: KVKK kapsamındaki haklarınızı kullanmak için cem@uzunyasa.com adresine başvurabilirsiniz.',
      ]
    },
    kullanim: {
      title: 'Kullanım Koşulları',
      content: [
        'Canım uygulaması, önleyici sağlık taramalarında rehberlik amacıyla geliştirilmiştir.',
        'Uygulama, tıbbi tavsiye, tanı veya tedavi yerine geçmez. Sağlık konularında mutlaka bir hekime danışın.',
        'Tarama önerileri USPSTF, ADA, ESC ve benzeri uluslararası kılavuzlara dayalıdır; kılavuzlar zaman içinde güncellenebilir.',
        'Uygulamayı kullanarak bu koşulları kabul etmiş sayılırsınız.',
        'İletişim: cem@uzunyasa.com',
      ]
    },
    iletisim: {
      title: 'İletişim',
      content: [
        'Dr. Cem Şimşek',
        'E-posta: cem@uzunyasa.com',
        'Web: uzunyasa.com',
        'Her türlü görüş, öneri ve geri bildiriminiz için iletişime geçebilirsiniz.',
      ]
    },
  }

  const current = pages[page] || pages.gizlilik

  return (
    <div className="flex flex-col h-full" style={{background:'#FAFAF8'}}>
      <div className="px-5 pt-12 pb-4 bg-white border-b border-gray-100 flex items-center gap-3">
        <button onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xl font-bold"
          style={{minWidth:44,minHeight:44}} aria-label="Geri">←</button>
        <h1 className="text-xl font-bold" style={{color:'#0D7377'}}>{current.title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {current.content.map((para, i) => (
          <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
        ))}
      </div>
    </div>
  )
}
