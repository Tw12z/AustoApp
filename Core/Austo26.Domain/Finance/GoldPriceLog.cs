using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Finance;

public class GoldPriceLog : BaseEntity
{
    public DateTime Date { get; private set; }
    public decimal GramGoldBuyTRY { get; private set; }    // Gram altın alış
    public decimal GramGoldSellTRY { get; private set; }   // Gram altın satış
    public decimal? GramK14BuyTRY { get; private set; }
    public decimal? GramK14SellTRY { get; private set; }
    public decimal? GramK18BuyTRY { get; private set; }
    public decimal? GramK18SellTRY { get; private set; }
    public decimal? GramK22BuyTRY { get; private set; }
    public decimal? GramK22SellTRY { get; private set; }

    // Döviz ve tam altın türleri — o anki satış fiyatı (RateCard'daki "esas" fiyatla aynı kural)
    public decimal? UsdTRY { get; private set; }
    public decimal? EurTRY { get; private set; }
    public decimal? GbpTRY { get; private set; }
    public decimal? CeyrekAltinTRY { get; private set; }
    public decimal? YarimAltinTRY { get; private set; }
    public decimal? TamAltinTRY { get; private set; }
    public decimal? CumhuriyetAltinTRY { get; private set; }
    public decimal? AtaLiraTRY { get; private set; }

    public string Source { get; private set; }             // "Turuncgil", "Manuel" vs.

    protected GoldPriceLog() { Source = null!; }

    public GoldPriceLog(DateTime date, decimal gramBuy, decimal gramSell, string source,
                        decimal? k14Buy = null, decimal? k14Sell = null,
                        decimal? k18Buy = null, decimal? k18Sell = null,
                        decimal? k22Buy = null, decimal? k22Sell = null,
                        decimal? usdTRY = null, decimal? eurTRY = null, decimal? gbpTRY = null,
                        decimal? ceyrekAltinTRY = null, decimal? yarimAltinTRY = null,
                        decimal? tamAltinTRY = null, decimal? cumhuriyetAltinTRY = null,
                        decimal? ataLiraTRY = null)
    {
        if (gramBuy <= 0 || gramSell <= 0) throw new ArgumentException("Altın fiyatı sıfırdan büyük olmalıdır.");
        Date = date;
        GramGoldBuyTRY  = gramBuy;
        GramGoldSellTRY = gramSell;
        GramK14BuyTRY   = k14Buy;
        GramK14SellTRY  = k14Sell;
        GramK18BuyTRY   = k18Buy;
        GramK18SellTRY  = k18Sell;
        GramK22BuyTRY   = k22Buy;
        GramK22SellTRY  = k22Sell;
        UsdTRY              = usdTRY;
        EurTRY              = eurTRY;
        GbpTRY              = gbpTRY;
        CeyrekAltinTRY      = ceyrekAltinTRY;
        YarimAltinTRY       = yarimAltinTRY;
        TamAltinTRY         = tamAltinTRY;
        CumhuriyetAltinTRY  = cumhuriyetAltinTRY;
        AtaLiraTRY          = ataLiraTRY;
        Source = string.IsNullOrWhiteSpace(source) ? "Manuel" : source.Trim();
    }
}
