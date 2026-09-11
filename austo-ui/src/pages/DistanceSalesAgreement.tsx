import LegalPage from '../components/LegalPage'
import { legalInfo } from '../data/legalInfo'

export default function DistanceSalesAgreement() {
  return (
    <LegalPage title="Mesafeli Satış Sözleşmesi (Ön Bilgilendirme Formu)" updated={legalInfo.lastUpdated}>
      <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
        <strong style={{ color: '#D4AF37' }}>Not:</strong> Austo'nun ücretli abonelik
        altyapısı henüz devreye alınmamıştır. Bu sözleşme, ücretli plan
        başlatıldığında fiyat/ödeme yöntemi bilgileriyle güncellenecek ve
        ödeme onaylanmadan önce ayrıca sunulup kabulünüz alınacaktır. Bu
        sayfa şu an bilgilendirme amacıyla önceden yayınlanmıştır.
      </div>

      <h2>1. Taraflar</h2>
      <p>
        <strong>Satıcı/Hizmet Sağlayıcı:</strong> {legalInfo.providerName},
        {' '}{legalInfo.address}, <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a>
        {legalInfo.taxOrTckn !== '[VERGİ NUMARASI / TCKN]' && <> (Vergi No/TCKN: {legalInfo.taxOrTckn})</>}
        <br />
        <strong>Alıcı:</strong> Austo'ya üye olan ve ücretli aboneliği satın alan gerçek/tüzel kişi ("Üye").
      </p>

      <h2>2. Sözleşmenin Konusu</h2>
      <p>
        İşbu sözleşmenin konusu, Üye'nin Hizmet Sağlayıcı'ya ait Austo
        platformu üzerinden elektronik ortamda sipariş verdiği ücretli
        abonelik hizmetinin satışı ve ifasına ilişkin, 6502 sayılı
        Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin
        belirlenmesidir.
      </p>

      <h2>3. Hizmetin Temel Özellikleri ve Fiyatı</h2>
      <p>
        Abonelik planı, kapsamı, süresi (aylık/yıllık) ve KDV dahil fiyatı,
        Üye ödeme adımına geçmeden önce Hizmet üzerinde açıkça gösterilir ve
        yalnızca Üye'nin bu bilgileri görüp onaylamasından sonra ödeme
        alınır. [ABONELİK PLANI, FİYAT VE FATURALANDIRMA DÖNEMİ — ödeme
        altyapısı entegre edildiğinde bu bölüm güncellenecektir.]
      </p>

      <h2>4. Ödeme Şekli ve Faturalandırma</h2>
      <p>
        Ödemeler, Hizmet üzerinde belirtilen güvenli ödeme altyapısı
        aracılığıyla alınır. Ödeme sonrasında Üye'ye e-posta yoluyla
        elektronik fatura/e-arşiv fatura iletilir. Abonelik, aksi
        belirtilmedikçe dönem sonunda otomatik olarak yenilenebilir; Üye,
        yenilemeyi hesap ayarlarından istediği zaman iptal edebilir.
      </p>

      <h2>5. Cayma Hakkı</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca,
        <strong> elektronik ortamda anında ifa edilen hizmetler ve
        gayri maddi mallar</strong> ile ilgili sözleşmelerde, Üye'nin ifanın
        derhâl başlamasını kabul etmesi hâlinde cayma hakkı
        kullanılamaz. Üye, ödeme onayı sırasında Hizmet'in derhal aktif
        edilmesini/kullanılmaya başlanmasını onayladığı takdirde, bu onay
        anından itibaren cayma hakkının sona ereceğini kabul eder. Hizmet
        henüz kullanılmaya başlanmamışsa, Üye ödeme tarihinden itibaren 14
        gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını
        kullanabilir; bu durumda ödenen bedel 14 gün içinde iade edilir.
      </p>

      <h2>6. Sözleşmenin Feshi / Aboneliğin İptali</h2>
      <p>
        Üye, aboneliğini dilediği zaman hesap ayarlarından veya
        {' '}<a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a>{' '}
        adresine talepte bulunarak iptal edebilir; iptal, cari
        faturalandırma döneminin sonunda geçerli olur ve kalan süre için
        kısmi iade yapılmaz (aksi Hizmet üzerinde ayrıca belirtilmedikçe).
        Hizmet Sağlayıcı, Kullanım Koşulları'nın ihlali hâlinde aboneliği
        tek taraflı olarak sonlandırma hakkını saklı tutar.
      </p>

      <h2>7. Uyuşmazlıkların Çözümü</h2>
      <p>
        İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığınca her yıl
        ilan edilen parasal sınırlar dahilinde Üye'nin yerleşim yerindeki
        Tüketici Hakem Heyetleri, bu sınırları aşan uyuşmazlıklarda ise
        Tüketici Mahkemeleri yetkilidir.
      </p>

      <h2>8. Yürürlük</h2>
      <p>
        Üye, ödeme adımını onaylayarak işbu Ön Bilgilendirme Formu'nu ve
        Mesafeli Satış Sözleşmesi'ni okuduğunu ve kabul ettiğini beyan eder.
      </p>
    </LegalPage>
  )
}
