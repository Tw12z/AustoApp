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

    [HttpGet("valuation")]
    public async Task<IActionResult> GetValuation() => Ok(await _service.GetValuationAsync());
}
