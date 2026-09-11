import LegalPage from '../components/LegalPage'
import { legalInfo } from '../data/legalInfo'

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Gizlilik Politikası ve KVKK Aydınlatma Metni" updated={legalInfo.lastUpdated}>
      <h2>1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Austo
        hizmetine üye olurken paylaştığınız kişisel verileriniz bakımından veri
        sorumlusu <strong>{legalInfo.providerName}</strong>'dır
        {legalInfo.mersisNo !== '[MERSİS NO (varsa)]' && <> (MERSİS: {legalInfo.mersisNo})</>}.
        İletişim: <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a>, {legalInfo.address}.
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik ve iletişim verileri:</strong> ad-soyad, kullanıcı adı, e-posta adresi,</li>
        <li><strong>Hesap güvenliği verileri:</strong> şifrenizin geri döndürülemez biçimde hash'lenmiş hâli (şifrenizin kendisi hiçbir zaman düz metin olarak saklanmaz),</li>
        <li><strong>İşlem/log verileri:</strong> giriş zamanları, e-posta doğrulama/şifre sıfırlama talepleri ve bunlara ait zaman damgaları,</li>
        <li><strong>Kullanıcı tarafından sisteme girilen işletme verileri:</strong> ürün, stok, satış, alış, tedarikçi ve müşteri kayıtları (bkz. Madde 8).</li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <ul>
        <li>Üyelik oluşturma, hesap doğrulama ve kimlik teyidi,</li>
        <li>Hizmet'in sunulması, sürdürülmesi ve teknik olarak çalışır durumda tutulması,</li>
        <li>Şifre sıfırlama, e-posta doğrulama gibi hesap güvenliği süreçlerinin yürütülmesi,</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi ve hukuki taleplere yanıt verilmesi,</li>
        <li>Hizmet kalitesinin ölçülmesi ve geliştirilmesi.</li>
      </ul>

      <h2>4. Hukuki Sebep</h2>
      <p>
        Kişisel verileriniz, KVKK'nın 5. maddesinin 2. fıkrasının (c) bendi
        uyarınca <strong>bir sözleşmenin kurulması veya ifasıyla doğrudan
        ilgili olması</strong> (üyelik sözleşmesinin kurulması ve Hizmet'in
        sunulması), (ç) bendi uyarınca <strong>hukuki yükümlülüğün yerine
        getirilmesi</strong> ve (f) bendi uyarınca <strong>meşru menfaat</strong> hukuki
        sebeplerine dayanılarak, açık rıza aranmaksızın işlenmektedir. Bu
        kapsamların dışına çıkan bir işleme (örn. pazarlama amaçlı e-posta
        gönderimi) söz konusu olursa, ayrıca açık rızanız talep edilecektir.
      </p>

      <h2>5. Kişisel Verilerin Aktarılması</h2>
      <p>
        Verileriniz, Hizmet'in barındırıldığı bulut sunucu sağlayıcısı (sunucu
        altyapısı) ve e-posta gönderim hizmeti (SMTP sağlayıcısı — doğrulama
        ve şifre sıfırlama e-postalarının iletilmesi amacıyla) ile
        sınırlı olmak üzere, yalnızca Hizmet'in çalışması için gerekli
        ölçüde paylaşılır. Kullanılan altyapı sağlayıcısının sunucu
        konumuna bağlı olarak veriler yurt dışına aktarılabilir; bu durumda
        KVKK'nın 9. maddesindeki yurt dışına aktarım şartlarına uyulur. Verileriniz
        hiçbir şekilde ticari amaçla üçüncü kişilere satılmaz veya
        pazarlama amacıyla paylaşılmaz.
      </p>

      <h2>6. Toplama Yöntemi</h2>
      <p>
        Kişisel verileriniz, üyelik/kayıt formu, hesap ayarları ve Hizmet'in
        normal kullanımı sırasında elektronik ortamda, doğrudan sizin
        tarafınızdan girilmesi suretiyle toplanır.
      </p>

      <h2>7. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
      <p>Kişisel veri sahibi olarak KVKK'nın 11. maddesi uyarınca:</p>
      <ul>
        <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme,</li>
        <li>Yapılan işlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
      </ul>
      <p>
        haklarına sahipsiniz. Bu haklarınızı kullanmak için <a href={`mailto:${legalInfo.contactEmail}`}>{legalInfo.contactEmail}</a> adresine
        yazılı olarak başvurabilirsiniz; talebiniz en geç 30 gün içinde
        sonuçlandırılır.
      </p>

      <h2>8. Sisteme Girdiğiniz Üçüncü Kişi Verileri Hakkında Önemli Not</h2>
      <p>
        Austo'yu bir işletme olarak kullanıyorsanız, sisteme kendi
        müşterilerinize, tedarikçilerinize veya çalışanlarınıza ait kişisel
        veriler (ad-soyad, telefon, e-posta, TC kimlik/vergi numarası vb.)
        girebilirsiniz. Bu veriler bakımından <strong>siz veri
        sorumlusu</strong>, Austo ise yalnızca sizin talimatınızla bu
        verileri barındıran <strong>veri işleyen</strong> sıfatındadır.
        Bu kişilerden KVKK uyarınca gerekli aydınlatmanın yapılması ve
        gerekiyorsa açık rızanın alınması sizin sorumluluğunuzdadır.
      </p>

      <h2>9. Yerel Depolama (localStorage)</h2>
      <p>
        Austo, çerez (cookie) kullanmaz. Oturumunuzu açık tutmak için
        tarayıcınızın <strong>localStorage</strong> alanında yalnızca
        oturum kimlik doğrulama jetonu (JWT) saklanır; bu veri yalnızca
        sizin cihazınızda tutulur ve Austo sunucularına
        her istek sırasında kimlik doğrulama amacıyla iletilir. Çıkış
        yaptığınızda bu jeton cihazınızdan silinir.
      </p>

      <h2>10. Veri Güvenliği</h2>
      <p>
        Şifreniz geri döndürülemez biçimde hash'lenerek saklanır, Hizmet'e
        erişim HTTPS (SSL/TLS) üzerinden şifrelenmiş olarak sağlanır ve
        erişim, sektör standardı JWT tabanlı kimlik doğrulama ile
        korunur.
      </p>

      <h2>11. Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, hesabınız aktif olduğu sürece ve hesabınızı
        kapattıktan sonra yasal saklama yükümlülükleri (örn. ticari defter
        ve belge saklama süreleri) ile sınırlı olarak saklanır; bu sürelerin
        sonunda silinir, yok edilir veya anonim hâle getirilir.
      </p>

      <h2>12. Değişiklikler</h2>
      <p>
        Bu metin güncellenebilir; güncel sürüm her zaman bu sayfada yer
        alır.
      </p>
    </LegalPage>
  )
}
