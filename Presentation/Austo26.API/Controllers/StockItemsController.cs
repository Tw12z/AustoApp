using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Stock;
using Austo26.Domain.Stock;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StockItemsController : ControllerBase
{
    private readonly IStockItemService _service;

    public StockItemsController(IStockItemService service) { _service = service; }

    // GET /api/stock-items?productId=...&status=1&locationId=...
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? productId,
        [FromQuery] StockItemStatus? status,
        [FromQuery] Guid? locationId)
        => Ok(await _service.GetFilteredAsync(productId, status, locationId));

    // GET /api/stock-items/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    // GET /api/stock-items/by-code?code=AUSTO-00001
    [HttpGet("by-code")]
    public async Task<IActionResult> GetByCode([FromQuery] string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest(new { message = "Kod boş olamaz." });

        var item = await _service.GetByCodeAsync(code);
        return item is null ? NotFound(new { message = "Parça bulunamadı." }) : Ok(item);
    }

    // GET /api/stock-items/by-product/{productId}
    [HttpGet("by-product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
        => Ok(await _service.GetByProductAsync(productId));

    // POST /api/stock-items/batch
    [HttpPost("batch")]
    public async Task<IActionResult> CreateBatch([FromBody] CreateStockItemBatchRequest request)
    {
        try
        {
            var items = await _service.CreateBatchAsync(request);
            return Ok(items);
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // POST /api/stock-items/{id}/transfer
    [HttpPost("{id}/transfer")]
    public async Task<IActionResult> Transfer(Guid id, [FromBody] StockItemTransferRequest request)
    {
        try { await _service.TransferAsync(id, request); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // POST /api/stock-items/{id}/damage
    [HttpPost("{id}/damage")]
    public async Task<IActionResult> MarkDamaged(Guid id, [FromBody] StockItemDamageRequest request)
    {
        try { await _service.MarkDamagedAsync(id, request); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    // GET /api/stock-items/{id}/qr
    [HttpGet("{id}/qr")]
    public async Task<IActionResult> GetQR(Guid id)
    {
        try
        {
            var png = await _service.GetQRAsync(id);
            return File(png, "image/png");
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
