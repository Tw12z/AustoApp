using Austo26.Domain.Entities.Common;
using Austo26.Domain.Products;

namespace Austo26.Domain.Transactions;

public class SaleTransactionItem : BaseEntity
{
    public Guid SaleTransactionId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPriceTRY { get; private set; }
    public decimal WeightGram { get; private set; }     // Satış anındaki ürün gramı (snapshot)

    public SaleTransaction SaleTransaction { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    protected SaleTransactionItem() { }

    public SaleTransactionItem(Guid saleTransactionId, Guid productId,
                                decimal quantity, decimal unitPriceTRY, decimal weightGram)
    {
        if (quantity <= 0) throw new ArgumentException("Miktar sıfırdan büyük olmalıdır.", nameof(quantity));
        if (unitPriceTRY < 0) throw new ArgumentException("Birim fiyat negatif olamaz.", nameof(unitPriceTRY));
        if (weightGram < 0) throw new ArgumentException("Gram değeri negatif olamaz.", nameof(weightGram));

        SaleTransactionId = saleTransactionId;
        ProductId = productId;
        Quantity = quantity;
        UnitPriceTRY = unitPriceTRY;
        WeightGram = weightGram;
    }
}
