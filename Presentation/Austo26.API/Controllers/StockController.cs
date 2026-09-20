using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Stock;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StockController : ControllerBase
{
    private readonly IStockService _service;

    public StockController(IStockService service) { _service = service; }

    [HttpGet("movements")]
    public async Task<IActionResult> GetMovements([FromQuery] Guid? productId, [FromQuery] Guid? locationId)
        => Ok(await _service.GetMovementsAsync(productId, locationId));

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] StockTransferRequest request)
    {
        try { await _service.TransferAsync(request); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> Adjust([FromBody] StockAdjustRequest request)
    {
        try { await _service.AdjustAsync(request); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("valuation")]
    public async Task<IActionResult> GetValuation() => Ok(await _service.GetValuationAsync());

    // ── Konum bazlı stok ────────────────────────────────────────────────────

    // GET /api/stock/by-location
    // Her konumda toplam kaç parça var — Konumlar sayfasındaki adet kolonu.
    // Parçası oluşturulmamış adetler locationId: null satırında toplanır.
    [HttpGet("by-location")]
    public async Task<IActionResult> GetLocationSummaries()
        => Ok(await _service.GetLocationSummariesAsync());

    // GET /api/stock/by-location/{locationId}
    // Bir konumdaki ürünler ve adetleri — konuma tıklayınca açılan liste.
    [HttpGet("by-location/{locationId:guid}")]
    public async Task<IActionResult> GetLocationStock(Guid locationId)
    {
        try { return Ok(await _service.GetLocationStockAsync(locationId)); }
        catch (Exception ex) { return NotFound(new { message = ex.Message }); }
    }

    // GET /api/stock/by-location/unassigned
    // Konumu belirtilmemiş (parçası oluşturulmamış) adetler.
    [HttpGet("by-location/unassigned")]
    public async Task<IActionResult> GetUnassignedStock()
        => Ok(await _service.GetLocationStockAsync(null));

    // GET /api/stock/by-product
    // Tüm ürünlerin konum dağılımı — Stok sayfasındaki dağılım tablosu.
    [HttpGet("by-product")]
    public async Task<IActionResult> GetProductBreakdowns()
        => Ok(await _service.GetProductBreakdownsAsync());

    // GET /api/stock/by-product/{productId}
    // Bir ürünün konumlara göre dağılımı — Stok sayfasında ürüne tıklayınca.
    [HttpGet("by-product/{productId:guid}")]
    public async Task<IActionResult> GetProductBreakdown(Guid productId)
    {
        try { return Ok(await _service.GetProductLocationBreakdownAsync(productId)); }
        catch (Exception ex) { return NotFound(new { message = ex.Message }); }
    }
}
