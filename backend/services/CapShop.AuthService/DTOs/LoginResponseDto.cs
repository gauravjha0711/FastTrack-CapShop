public class LoginResponseDto
{
    public string Message { get; set; }
    public string ChallengeToken { get; set; }
    public string Role { get; set; }

    public List<string> AvailableMethods { get; set; }
}