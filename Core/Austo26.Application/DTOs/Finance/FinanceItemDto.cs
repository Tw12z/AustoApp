namespace Austo26.Application.DTOs.Finance;

public class FinanceItemDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal BuyingPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public string ChangeRate { get; set; } = string.Empty;
}
