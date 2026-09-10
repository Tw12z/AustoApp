namespace Austo26.Application.DTOs.Finance;

public record GoldPriceLogDto(
    Guid Id,
    DateTime Date,
    decimal GramGoldBuyTRY,
    decimal GramGoldSellTRY,
    decimal? GramK14BuyTRY,
    decimal? GramK14SellTRY,
    decimal? GramK18BuyTRY,
    decimal? GramK18SellTRY,
    decimal? GramK22BuyTRY,
    decimal? GramK22SellTRY,
    decimal? UsdTRY,
    decimal? EurTRY,
    decimal? GbpTRY,
    decimal? CeyrekAltinTRY,
    decimal? YarimAltinTRY,
    decimal? TamAltinTRY,
    decimal? CumhuriyetAltinTRY,
    decimal? AtaLiraTRY,
    string Source
);

public record LogGoldPriceRequest(
    decimal GramGoldBuyTRY,
    decimal GramGoldSellTRY,
    decimal? GramK14BuyTRY,
    decimal? GramK14SellTRY,
    decimal? GramK18BuyTRY,
    decimal? GramK18SellTRY,
    decimal? GramK22BuyTRY,
    decimal? GramK22SellTRY
);
