using Austo26.Domain.Users;

namespace Austo26.Application.DTOs.Auth;

public class RegisterDto
{
    public required string FullName { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public UserRole Role { get; set; } = UserRole.Staff;
}
