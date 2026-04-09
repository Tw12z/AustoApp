using Austo26.Domain.Customers;
using Austo26.Domain.Entities.Common;
using Austo26.Domain.Products;
using Austo26.Domain.Suppliers;

namespace Austo26.Domain.Transactions;

public class PurchaseTransaction : BaseEntity
{
    public Guid? SupplierId { get; private set; }
    public Guid? CustomerId { get; private set; }       // Müşteriden hurda/ikinci el alışı
    public DateTime PurchaseDate { get; private set; }
    public decimal TotalAmountTRY { get; private set; }
    public decimal WeightGram { get; private set; }
    public GoldPurity Purity { get; private set; }
    public PurchaseSourceType SourceType { get; private set; }
    public string? Notes { get; private set; }
    public TransactionStatus Status { get; private set; }

    public Supplier? Supplier { get; private set; }
    public Customer? Customer { get; private set; }

    protected PurchaseTransaction() { }

    public PurchaseTransaction(DateTime purchaseDate, decimal totalAmountTRY, decimal weightGram,
                                GoldPurity purity, PurchaseSourceType sourceType,
                                Guid? supplierId = null, Guid? customerId = null, string? notes = null)
    {
        if (totalAmountTRY < 0) throw new ArgumentException("Toplam tutar negatif olamaz.");
        if (weightGram <= 0) throw new ArgumentException("Gram değeri sıfırdan büyük olmalıdır.");

        PurchaseDate = purchaseDate;
        TotalAmountTRY = totalAmountTRY;
        WeightGram = weightGram;
        Purity = purity;
        SourceType = sourceType;
        SupplierId = supplierId;
        CustomerId = customerId;
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        Status = TransactionStatus.Completed;
    }

    public void Cancel() { Status = TransactionStatus.Cancelled; Touch(); }
}
