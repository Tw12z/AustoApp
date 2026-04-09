namespace Austo26.Domain.Products;

/// <summary>
/// Altın saflık derecesi (Ayar). Türkiye kuyumculuğunda yaygın ayarlar.
/// </summary>
public enum GoldPurity
{
    K8  = 8,   // 333 - 8 Ayar
    K14 = 14,  // 585 - 14 Ayar (Türkiye'de en yaygın)
    K18 = 18,  // 750 - 18 Ayar
    K21 = 21,  // 875 - 21 Ayar
    K22 = 22,  // 916 - 22 Ayar (bilezik, sikke)
    K24 = 24,  // 999 - 24 Ayar (Has Altın)
    Diger = 0  // Hurda veya standart dışı
}
