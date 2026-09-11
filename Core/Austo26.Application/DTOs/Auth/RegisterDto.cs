using Austo26.Domain.Users;

namespace Austo26.Application.DTOs.Auth;

public class RegisterDto
{
    public required string FullName { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public UserRole Role { get; set; } = UserRole.Staff;

    // Must both be true to register — enforced server-side in AuthService
    // regardless of what the client sends, so this is a UX nicety (lets the
    // form disable itself early) rather than the actual gate.
    public bool AcceptedTerms { get; set; }
    public bool AcceptedPrivacy { get; set; }
}
