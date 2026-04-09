using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Finance;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _financeService;
    private readonly IGoldPriceService _goldPriceService;

    public FinanceController(IFinanceService financeService, IGoldPriceService goldPriceService)
    {
        _financeService   = financeService;
        _goldPriceService = goldPriceService;
    }

    [HttpGet("live")]
    public async Task<IActionResult> GetLiveRates() => Ok(await _financeService.GetLiveRatesAsync());

    [HttpGet("gold-price/latest")]
    public async Task<IActionResult> GetLatestGoldPrice() => Ok(await _goldPriceService.GetLatestAsync());

    [HttpGet("gold-price/history")]
    public async Task<IActionResult> GetGoldPriceHistory([FromQuery] int days = 30)
        => Ok(await _goldPriceService.GetHistoryAsync(days));

    [HttpPost("gold-price")]
    public async Task<IActionResult> LogGoldPrice([FromBody] LogGoldPriceRequest request)
    {
        try
        {
            var log = await _goldPriceService.LogManualPriceAsync(request);
            return CreatedAtAction(nameof(GetLatestGoldPrice), new { id = log.Id }, log);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
