namespace Austo26.Domain.Transactions;

public enum TransactionStatus
{
    Completed = 1,
    Cancelled = 2,
    Pending   = 3
}

public enum PurchaseSourceType
{
    Supplier  = 1,  // Tedarikçiden alış
    Customer  = 2,  // Müşteriden hurda/ikinci el alışı
    ScrapGold = 3   // Hurda altın alışı
}
