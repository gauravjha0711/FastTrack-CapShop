namespace CapShop.AuthService.DTOs
{
    public class LoginInitiateResponseDto
    {
        public string TempLoginToken { get; set; } = string.Empty;
        public List<string> AvailableMethods { get; set; } = new();
        public bool IsAuthenticatorConfigured { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}