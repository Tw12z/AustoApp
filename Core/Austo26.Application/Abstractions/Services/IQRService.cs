namespace Austo26.Application.Abstractions.Services;

public interface IQRService
{
    byte[] GenerateQRCode(string text);
}
