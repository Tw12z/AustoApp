using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.DemoRequests;
using Austo26.Domain.DemoRequests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

// Explicit kebab-case route: the default "api/[controller]" token would produce
// "api/DemoRequests", but the frontend (and every other multi-word resource it
// expects, e.g. /stock-items) calls kebab-case paths.
[Route("api/demo-requests")]
[ApiController]
public class DemoRequestsController : ControllerBase
{
    private readonly IDemoRequestService _service;

    public DemoRequestsController(IDemoRequestService service) { _service = service; }

    /// <summary>Public — submitted from the landing page's "Demo Talep Et" form (no account required).</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateDemoRequestDto request)
    {
        try
        {
            await _service.CreateAsync(request);
            return Ok(new { message = "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz." });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    /// <summary>Admin-only — the leads list contains third-party contact info (phone/email).</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateDemoRequestStatusRequest request)
    {
        try
        {
            await _service.UpdateStatusAsync(id, (DemoRequestStatus)request.Status);
            return NoContent();
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
