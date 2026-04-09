namespace Austo26.Application.Settings;

public class MailSettings
{
    public required string DisplayName { get; set; }
    public required string From { get; set; }
    public string Host { get; set; } = null!;
    public int Port { get; set; }
    public string UserName { get; set; } = null!;
    public string Password { get; set; } = null!;
}
