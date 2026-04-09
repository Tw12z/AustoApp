using Austo26.Domain.Entities.Common;
using Austo26.Domain.Entities.Locations;
using Austo26.Domain.Products;

namespace Austo26.Domain.Stock;

public class StockMovement : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid? LocationId { get; private set; }      // Kaynak lokasyon
    public Guid? ToLocationId { get; private set; }    // Hedef lokasyon (transfer için)
    public decimal Quantity { get; private set; }
    public StockMovementType Type { get; private set; }
    public string? Description { get; private set; }
    public Guid? ReferenceId { get; private set; }     // İlişkili satış / alış id

    public Product Product { get; private set; } = null!;
    public Location? Location { get; private set; }
    public Location? ToLocation { get; private set; }

    protected StockMovement() { }

    public StockMovement(Guid productId, decimal quantity, StockMovementType type,
                         Guid? locationId = null, Guid? toLocationId = null,
                         string? description = null, Guid? referenceId = null)
    {
        if (quantity <= 0) throw new ArgumentException("Hareket miktarı sıfırdan büyük olmalıdır.", nameof(quantity));
        ProductId    = productId;
        Quantity     = quantity;
        Type         = type;
        LocationId   = locationId;
        ToLocationId = toLocationId;
        Description  = description;
        ReferenceId  = referenceId;
    }
}
