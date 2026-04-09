using Austo26.Domain.Customers;
using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Transactions;

public class SaleTransaction : BaseEntity
{
    public Guid? CustomerId { get; private set; }
    public DateTime SaleDate { get; private set; }
    public decimal TotalAmountTRY { get; private set; }
    public decimal TotalWeightGram { get; private set; }
    public string? Notes { get; private set; }
    public TransactionStatus Status { get; private set; }

    public Customer? Customer { get; private set; }

    private readonly List<SaleTransactionItem> _items = new();
    public IReadOnlyCollection<SaleTransactionItem> Items => _items.AsReadOnly();

    protected SaleTransaction() { }

    public SaleTransaction(Guid? customerId, DateTime saleDate, string? notes = null)
    {
        CustomerId = customerId;
        SaleDate = saleDate;
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        Status = TransactionStatus.Pending;
        TotalAmountTRY = 0;
        TotalWeightGram = 0;
    }

    public void AddItem(SaleTransactionItem item)
    {
        _items.Add(item);
        TotalAmountTRY += item.UnitPriceTRY * item.Quantity;
        TotalWeightGram += item.WeightGram * item.Quantity;
        Touch();
    }

    public void Complete() { Status = TransactionStatus.Completed; Touch(); }
    public void Cancel() { Status = TransactionStatus.Cancelled; Touch(); }
}
