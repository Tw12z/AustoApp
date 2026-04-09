namespace Austo26.Application.DTOs.Auth;

public class ResetPasswordDto
{
    public required string Token { get; set; }
    public required string NewPassword { get; set; }
}
