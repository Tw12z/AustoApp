using Austo26.Application.Abstractions.Services;
using QRCoder;

namespace Austo26.Infrastructure.Services;

public class QRService : IQRService
{
    public byte[] GenerateQRCode(string text)
    {
        QRCodeGenerator generator = new();
        QRCodeData data = generator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
        PngByteQRCode code = new(data);
        return code.GetGraphic(10);
    }
}
