// Central place for the identity/contact details Turkish law requires the
// legal pages to disclose (KVKK Aydınlatma Metni, Mesafeli Satış Sözleşmesi).
//
// providerName/taxOrTckn/address are left as placeholders on purpose: no
// personal data should be committed to a public repo without the account
// holder explicitly choosing to publish it. Fill these in — with a
// registered "şahıs şirketi" or company's info, ideally, once payment
// actually goes live — before relying on the Mesafeli Satış Sözleşmesi in a
// real dispute. Bump `version` whenever the legal text changes materially;
// it's what gets recorded against each user's consent at registration.
export const legalInfo = {
  providerName: '[HİZMET SAĞLAYICI ADI / UNVANI]',
  taxOrTckn: '[VERGİ NUMARASI / TCKN]',
  address: '[İŞLETME ADRESİ]',
  contactEmail: 'destek@austo.com.tr',
  mersisNo: '[MERSİS NO (varsa)]',
  lastUpdated: '11.09.2026',
  version: '1.0',
}
