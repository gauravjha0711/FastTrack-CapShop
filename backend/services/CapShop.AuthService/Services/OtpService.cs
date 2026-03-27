using System.Security.Cryptography;

namespace CapShop.AuthService.Services
{
    public class OtpService
    {
        public string GenerateOtp()
        {
            return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }
    }
}