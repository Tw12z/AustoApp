using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Transactions;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SalesController : ControllerBase
{
    private readonly ISaleService _service;

    public SalesController(ISaleService service) { _service = service; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var sale = await _service.GetByIdAsync(id);
        return sale is null ? NotFound() : Ok(sale);
    }

    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(Guid customerId)
        => Ok(await _service.GetByCustomerAsync(customerId));

    [HttpGet("by-date")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime from, [FromQuery] DateTime to)
        => Ok(await _service.GetByDateRangeAsync(from, to));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest request)
    {
        try
        {
            var sale = await _service.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = sale.Id }, new { id = sale.Id });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try { await _service.CancelAsync(id); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
