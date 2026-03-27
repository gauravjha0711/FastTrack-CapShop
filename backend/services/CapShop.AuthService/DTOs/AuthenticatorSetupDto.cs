namespace CapShop.AuthService.DTOs
{
    public class AuthenticatorSetupDto
    {
        public bool IsAlreadyEnabled { get; set; }
        public string ManualKey { get; set; } = string.Empty;
        public string QrCodeUri { get; set; } = string.Empty;
        public string QrCodeImageBase64 { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}