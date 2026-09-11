import LegalPage from '../components/LegalPage'
import { legalInfo } from '../data/legalInfo'

export default function TermsOfService() {
  return (
    <LegalPage title="Kullanım Koşulları (Üyelik Sözleşmesi)" updated={legalInfo.lastUpdated}>
      <h2>1. Taraflar</h2>
      <p>
        İşbu Kullanım Koşulları ("Sözleşme"), <strong>{legalInfo.providerName}</strong>
        {' '}("Austo" veya "Hizmet Sağlayıcı") tarafından işletilen Austo kuyumcu
        yönetim sistemi ("Hizmet") ile bu hizmete üye olan gerçek/tüzel kişi
        ("Kullanıcı") arasında, Kullanıcı'nın üyelik kaydını tamamlamasıyla
        birlikte yürürlüğe girer.
      </p>

      <h2>2. Hizmetin Kapsamı</h2>
      <p>
        Austo; stok, ürün, müşteri, tedarikçi, satış, alış ve finans takibi gibi
        işlevleri bir arada sunan bulut tabanlı bir kuyumcu/işletme yönetim
        yazılımıdır (SaaS). Hizmetin kapsamı, özellikleri ve arayüzü, Kullanıcı'ya
        önceden haber verilerek zaman içinde geliştirilebilir, değiştirilebilir
        veya bazı özellikler kaldırılabilir.
      </p>

      <h2>3. Üyelik ve Hesap Güvenliği</h2>
      <ul>
        <li>Kayıt sırasında verilen bilgilerin doğru, güncel ve eksiksiz olması Kullanıcı'nın sorumluluğundadır.</li>
        <li>Hesap şifresinin gizliliğinden ve hesap üzerinden gerçekleştirilen tüm işlemlerden Kullanıcı sorumludur.</li>
        <li>Hesabın yetkisiz kullanıldığından şüphelenilmesi halinde Austo'ya <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a> üzerinden derhal bildirimde bulunulmalıdır.</li>
        <li>Bir işletme adına birden fazla kullanıcı (Admin/Personel rolleriyle) tanımlanabilir; Admin rolündeki kullanıcı, kendi işletmesi altındaki personel hesaplarından da sorumludur.</li>
      </ul>

      <h2>4. Kullanıcının Sisteme Girdiği Üçüncü Kişi Verileri</h2>
      <p>
        Kullanıcı, Hizmet üzerinden kendi müşterilerine, tedarikçilerine ve
        çalışanlarına ait ad-soyad, telefon, e-posta, TC kimlik/vergi numarası
        gibi kişisel verileri sisteme girebilir. Bu veriler bakımından
        Kullanıcı, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")
        uyarınca <strong>veri sorumlusu</strong> sıfatını taşır; Austo ise
        yalnızca bu verileri Kullanıcı'nın talimatıyla barındıran/işleyen
        <strong> veri işleyen</strong> konumundadır. Kullanıcı, kendi
        müşterilerinden/çalışanlarından gerekli KVKK aydınlatmasını ve varsa
        açık rızayı almakla bizzat yükümlüdür; Austo bu konuda herhangi bir
        sorumluluk üstlenmez.
      </p>

      <h2>5. Yasaklı Kullanımlar</h2>
      <ul>
        <li>Hizmeti hukuka aykırı, dolandırıcılık amaçlı veya üçüncü kişilerin haklarını ihlal edecek şekilde kullanmak,</li>
        <li>Sisteme yetkisiz erişim denemesi, tersine mühendislik veya güvenlik açığı istismarı,</li>
        <li>Hizmetin işleyişini bozacak şekilde otomatik/aşırı istek göndermek (rate-limit aşımı, DoS vb.)</li>
        <li>yasaktır ve hesabın askıya alınması/sonlandırılması ile sonuçlanabilir.</li>
      </ul>

      <h2>6. Fikri Mülkiyet</h2>
      <p>
        Austo'nun yazılımı, arayüz tasarımı, logosu ve marka unsurları Hizmet
        Sağlayıcı'ya aittir. Kullanıcı'ya yalnızca Hizmet'i sözleşme
        kapsamında kullanmak üzere kişisel, devredilemez bir kullanım hakkı
        tanınır; kaynak kod veya tasarımlar üzerinde başkaca bir hak
        doğmaz.
      </p>

      <h2>7. Ücretlendirme</h2>
      <p>
        Austo, ücretsiz ve/veya ücretli abonelik planları sunabilir. Ücretli
        bir plana geçildiğinde fiyat, ödeme yöntemi, faturalandırma dönemi ve
        cayma koşulları ayrıca sunulacak olan <a href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a>
        {' '}ile belirlenir ve o sözleşme onaylanmadan ücretli işlem
        gerçekleştirilmez. Fiyatlandırmada yapılacak değişiklikler mevcut
        dönem sonuna kadar Kullanıcı'ya bildirilir.
      </p>

      <h2>8. Hizmetin Sürekliliği ve Sorumluluğun Sınırlandırılması</h2>
      <p>
        Austo, Hizmet'in kesintisiz ve hatasız çalışacağını garanti etmez;
        makul özeni göstermekle birlikte sunucu bakımı, üçüncü taraf altyapı
        sağlayıcı kesintileri veya mücbir sebepler nedeniyle oluşabilecek
        kesintilerden dolayı sorumluluk kabul etmez. Austo, dolaylı zararlar
        (kâr kaybı, veri kaybı, iş kaybı dahil) bakımından, ilgili mevzuatın
        izin verdiği azami ölçüde sorumluluktan muaftır. Kullanıcı, işletmesi
        için kritik verileri düzenli olarak yedeklemekten kendisi sorumludur.
      </p>

      <h2>9. Fesih</h2>
      <p>
        Kullanıcı, hesabını dilediği zaman <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a>
        {' '}adresine talepte bulunarak kapatabilir. Austo, işbu Sözleşme'nin
        ihlali halinde Kullanıcı'ya bildirimde bulunarak veya bulunmaksızın
        hesabı askıya alma veya sonlandırma hakkını saklı tutar.
      </p>

      <h2>10. Gizlilik</h2>
      <p>
        Kişisel verilerin işlenmesine ilişkin detaylar <a href="/gizlilik-politikasi">Gizlilik Politikası ve KVKK Aydınlatma Metni</a>'nde
        yer almaktadır; bu metin işbu Sözleşme'nin ayrılmaz bir parçasıdır.
      </p>

      <h2>11. Değişiklikler</h2>
      <p>
        Austo, işbu Sözleşme'yi güncelleyebilir. Maddi değişiklikler,
        Kullanıcı'nın kayıtlı e-posta adresine bildirilir veya Hizmet
        üzerinden duyurulur; Hizmet'in değişiklik sonrası kullanılmaya devam
        edilmesi güncel koşulların kabulü anlamına gelir.
      </p>

      <h2>12. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
      <p>
        İşbu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşme'den
        doğabilecek uyuşmazlıklarda Hizmet Sağlayıcı'nın yerleşim yerindeki
        mahkeme ve icra daireleri yetkilidir.
      </p>

      <h2>13. İletişim</h2>
      <p>
        Sorularınız için: <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a>
      </p>
    </LegalPage>
  )
}
