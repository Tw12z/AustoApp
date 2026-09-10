using Austo26.Application.Abstractions.Services;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;

    public ReportsController(IReportService service) { _service = service; }

    [HttpGet("daily")]
    public async Task<IActionResult> GetDaily([FromQuery] DateTime? date)
        => Ok(await _service.GetDailySummaryAsync(date ?? DateTime.Today));

    [HttpGet("range")]
    public async Task<IActionResult> GetRange([FromQuery] DateTime from, [FromQuery] DateTime to)
        => Ok(await _service.GetRangeSummaryAsync(from, to));

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock()
        => Ok(await _service.GetStockReportAsync());
}
