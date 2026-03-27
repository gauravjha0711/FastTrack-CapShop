using OtpNet;
using QRCoder;

namespace CapShop.AuthService.Services
{
    public class AuthenticatorService
    {
        public string GenerateSecretKey()
        {
            var key = KeyGeneration.GenerateRandomKey(20);
            return Base32Encoding.ToString(key);
        }

        public string GenerateQrCodeUri(string email, string key)
        {
            return $"otpauth://totp/CapShop:{email}?secret={key}&issuer=CapShop";
        }

        public string GenerateQrCodeImage(string qrText)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrText, QRCodeGenerator.ECCLevel.Q);
            Base64QRCode qrCode = new Base64QRCode(qrCodeData);

            return qrCode.GetGraphic(20);
        }

        public bool ValidateOtp(string key, string otp)
        {
            var keyBytes = Base32Encoding.ToBytes(key);
            var totp = new Totp(keyBytes);

            return totp.VerifyTotp(otp, out long _, new VerificationWindow(2, 2));
        }
    }
}