using Austo26.Domain.Entities.Common;
using Austo26.Domain.Entities.Locations;
using Austo26.Domain.Products;
using Austo26.Domain.Transactions;

namespace Austo26.Domain.Stock;

public class StockItem : BaseEntity
{
    public string ItemCode { get; private set; } = null!;   // AUSTO-00001
    public Guid ProductId { get; private set; }
    public Guid? LocationId { get; private set; }
    public StockItemStatus Status { get; private set; } = StockItemStatus.Available;
    public Guid? PurchaseTransactionId { get; private set; }
    public Guid? SaleTransactionItemId { get; private set; }
    public string? Notes { get; private set; }

    public Product Product { get; private set; } = null!;
    public Location? Location { get; private set; }
    public PurchaseTransaction? PurchaseTransaction { get; private set; }

    protected StockItem() { }

    public StockItem(string itemCode, Guid productId, Guid? locationId = null,
                     Guid? purchaseTransactionId = null, string? notes = null)
    {
        Id = Guid.NewGuid();
        ItemCode = itemCode;
        ProductId = productId;
        LocationId = locationId;
        PurchaseTransactionId = purchaseTransactionId;
        Notes = notes;
        Status = StockItemStatus.Available;
    }

    public void MarkSold(Guid? saleTransactionItemId = null)
    {
        Status = StockItemStatus.Sold;
        SaleTransactionItemId = saleTransactionItemId;
        Touch();
    }

    public void Transfer(Guid toLocationId, string? notes = null)
    {
        LocationId = toLocationId;
        if (notes is not null) Notes = notes;
        Touch();
    }

    public void MarkDamaged(string? notes = null)
    {
        Status = StockItemStatus.Damaged;
        if (notes is not null) Notes = notes;
        Touch();
    }

    public void MarkLost(string? notes = null)
    {
        Status = StockItemStatus.Lost;
        if (notes is not null) Notes = notes;
        Touch();
    }
}

public enum StockItemStatus
{
    Available = 1,
    Sold      = 2,
    Damaged   = 3,
    Lost      = 4
}
