using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Finance;
using System.Globalization;
using System.Text.Json;

namespace Austo26.Infrastructure.Services.Finance;

public class TuruncgilService : IFinanceService
{
    private readonly HttpClient _httpClient;

    public TuruncgilService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
            _httpClient.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    }

    public async Task<List<FinanceItemDto>> GetLiveRatesAsync()
    {
        var result = new List<FinanceItemDto>();
        const string url = "https://finans.truncgil.com/v3/today.json";

        try
        {
            var json = await _httpClient.GetStringAsync(url);
            if (json.Trim().StartsWith("<"))
            {
                result.Add(new FinanceItemDto { Code = "HATA", Name = "Bot engeli (User-Agent)" });
                return result;
            }

            using var doc = JsonDocument.Parse(json);
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                if (prop.Value.ValueKind != JsonValueKind.Object || !IsRelevant(prop.Name)) continue;

                var raw = JsonSerializer.Deserialize<TuruncgilRaw>(prop.Value.GetRawText(),
                              new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (raw is null) continue;

                result.Add(new FinanceItemDto
                {
                    Code          = MapCode(prop.Name),
                    Name          = prop.Name,
                    BuyingPrice   = Parse(raw.Buying),
                    SellingPrice  = Parse(raw.Selling),
                    ChangeRate    = raw.Change ?? ""
                });
            }
        }
        catch (Exception ex)
        {
            result.Add(new FinanceItemDto { Code = "HATA", Name = ex.Message });
        }

        return result;
    }

    private static bool IsRelevant(string code) => new[]
    {
        "USD", "EUR", "GBP",
        "gram-altin", "ceyrek-altin", "yarim-altin",
        "tam-altin", "cumhuriyet-altini", "ata-altin"
    }.Contains(code);

    private static string MapCode(string code) => code switch
    {
        "gram-altin"        => "GRAM ALTIN",
        "ceyrek-altin"      => "ÇEYREK ALTIN",
        "yarim-altin"       => "YARIM ALTIN",
        "tam-altin"         => "TAM ALTIN",
        "cumhuriyet-altini" => "CUMHURİYET",
        "ata-altin"         => "ATA LİRA",
        _                   => code
    };

    private static decimal Parse(string raw)
    {
        if (string.IsNullOrEmpty(raw)) return 0;
        var clean = raw.Replace("$", "").Replace(".", "").Trim();
        return decimal.TryParse(clean, NumberStyles.Any, new CultureInfo("tr-TR"), out var val) ? val : 0;
    }

    private class TuruncgilRaw
    {
        public string Buying  { get; set; } = "";
        public string Selling { get; set; } = "";
        public string Change  { get; set; } = "";
    }
}
