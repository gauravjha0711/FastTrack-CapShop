using CapShop.AuthService.Data;
using CapShop.AuthService.DTOs;
using CapShop.AuthService.Models;
using CapShop.AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CapShop.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly IPasswordHasherService _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly EmailService _emailService;
        private readonly OtpService _otpService;
        private readonly AuthenticatorService _authenticatorService;
        private readonly SmsService _smsService;

        public AuthController(
            AuthDbContext context,
            IPasswordHasherService passwordHasher,
            IJwtTokenService jwtTokenService,
            EmailService emailService,
            OtpService otpService,
            AuthenticatorService authenticatorService,
            SmsService smsService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
            _emailService = emailService;
            _otpService = otpService;
            _authenticatorService = authenticatorService;
            _smsService = smsService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException("User id not found in token.");
            }

            return int.Parse(userIdClaim);
        }

        private AuthResponseDto BuildAuthResponse(User user)
        {
            var token = _jwtTokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Role = user.RoleName,
                UserId = user.Id,
                Name = user.FullName,
                Username = user.Username,
                Email = user.Email
            };
        }

        private string BuildOtpEmailHtml(string heading, string otp)
        {
            return $@"
<html>
<head>
<style>
body {{
    margin:0;
    padding:0;
    background-color:#f4f6f9;
    font-family: Arial, Helvetica, sans-serif;
}}
.main {{
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border-radius:12px;
    border:1px solid #e5e5e5;
    overflow:hidden;
}}
.header {{
    background:#0d6efd;
    color:white;
    padding:20px;
    font-size:22px;
    text-align:center;
    font-weight:bold;
}}
.content {{
    padding:30px;
    text-align:center;
}}
.otp {{
    margin:20px auto;
    font-size:30px;
    letter-spacing:6px;
    font-weight:bold;
    color:#0d6efd;
    border:2px dashed #0d6efd;
    padding:15px 25px;
    display:inline-block;
    border-radius:8px;
    background:#f8fbff;
}}
.footer {{
    background:#f7f7f7;
    padding:15px;
    font-size:12px;
    color:#666;
    text-align:center;
}}
</style>
</head>
<body>
<div class='main'>
    <div class='header'>{heading}</div>
    <div class='content'>
        <p>Your OTP code is:</p>
        <div class='otp'>{otp}</div>
        <p>This OTP is valid for the next <b>5 minutes</b>.</p>
        <p>Please do not share this code with anyone.</p>
    </div>
    <div class='footer'>
        © 2026 CapShop Security
    </div>
</div>
</body>
</html>";
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();
            var normalizedUsername = request.Username.Trim().ToLower();

            var existingEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (existingEmail != null)
                return BadRequest(new { message = "Email already registered" });

            var existingUsername = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);

            if (existingUsername != null)
                return BadRequest(new { message = "Username already taken" });

            var otp = _otpService.GenerateOtp();

            var user = new User
            {
                Username = request.Username.Trim(),
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Phone = request.Phone.Trim(),
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RoleName = "Customer",
                IsActive = true,
                IsEmailVerified = false,
                EmailVerificationOtp = otp,
                EmailVerificationOtpExpiresAt = DateTime.UtcNow.AddMinutes(5),
                CreatedAt = DateTime.UtcNow,
                TwoFactorEnabled = false,
                AuthenticatorSecretKey = null,
                PendingAuthenticatorSecret = null
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                "CapShop Signup Verification OTP",
                BuildOtpEmailHtml("CapShop Signup Verification", otp));

            return Ok(new
            {
                message = "Signup initiated. OTP sent to your email.",
                email = user.Email
            });
        }

        [HttpPost("signup/verify-otp")]
        public async Task<IActionResult> VerifySignupOtp(VerifySignupOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.IsEmailVerified)
                return Ok(new { message = "Email already verified." });

            if (user.EmailVerificationOtp != request.Otp ||
                user.EmailVerificationOtpExpiresAt == null ||
                user.EmailVerificationOtpExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            user.IsEmailVerified = true;
            user.EmailVerificationOtp = null;
            user.EmailVerificationOtpExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully. You can now login." });
        }

        [HttpPost("login-initiate")]
        public async Task<IActionResult> LoginInitiate(LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive);

            if (user == null)
                return BadRequest(new { message = "Invalid email or password" });

            var validPassword = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);

            if (!validPassword)
                return BadRequest(new { message = "Invalid email or password" });

            if (!user.IsEmailVerified)
                return BadRequest(new { message = "Email is not verified. Please verify signup OTP first." });

            user.PendingLoginToken = Guid.NewGuid().ToString("N");
            user.PendingLoginTokenExpiresAt = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            var methods = new List<string> { "EmailOtp" };

            if (user.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                methods.Add("MobileOtp");
                methods.Add("WhatsappOtp");
            }
            else if (user.TwoFactorEnabled && !string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
            {
                methods.Add("Authenticator");
            }

            return Ok(new LoginInitiateResponseDto
            {
                TempLoginToken = user.PendingLoginToken,
                AvailableMethods = methods,
                IsAuthenticatorConfigured = user.TwoFactorEnabled,
                Message = "Password verified. Choose your second-factor method."
            });
        }

        [HttpPost("login/send-email-otp")]
        public async Task<IActionResult> SendLoginEmailOtp(SendLoginEmailOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            var otp = _otpService.GenerateOtp();

            user.LoginOtp = otp;
            user.LoginOtpExpiresAt = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                "CapShop Login OTP",
                BuildOtpEmailHtml("CapShop Login Verification", otp));

            return Ok(new { message = "Login OTP sent to your email." });
        }

        [HttpPost("login/send-mobile-otp")]
        public async Task<IActionResult> SendLoginMobileOtp(SendLoginEmailOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            if (!user.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Mobile OTP is allowed only for admin login." });

            if (string.IsNullOrWhiteSpace(user.Phone))
                return BadRequest(new { message = "Mobile number is not available for this account." });

            var otp = _otpService.GenerateOtp();

            user.LoginOtp = otp;
            user.LoginOtpExpiresAt = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            _smsService.SendOtp(user.Phone, otp);

            return Ok(new { message = "Login OTP sent to your mobile number." });
        }

        [HttpPost("login/send-whatsapp-otp")]
        public async Task<IActionResult> SendLoginWhatsappOtp(SendLoginWhatsappOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            if (!user.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "WhatsApp OTP is allowed only for admin login." });

            if (string.IsNullOrWhiteSpace(user.Phone))
                return BadRequest(new { message = "Mobile number is not available for this account." });

            var otp = _otpService.GenerateOtp();

            user.LoginOtp = otp;
            user.LoginOtpExpiresAt = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            _smsService.SendWhatsAppOtp(user.Phone, otp);

            return Ok(new { message = "Login OTP sent to your WhatsApp number." });
        }

        [HttpPost("login/verify-email-otp")]
        public async Task<IActionResult> VerifyLoginEmailOtp(VerifyLoginEmailOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            if (user.LoginOtp != request.Otp ||
                user.LoginOtpExpiresAt == null ||
                user.LoginOtpExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            user.LoginOtp = null;
            user.LoginOtpExpiresAt = null;
            user.PendingLoginToken = null;
            user.PendingLoginTokenExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("login/verify-whatsapp-otp")]
        public async Task<IActionResult> VerifyLoginWhatsappOtp(VerifyLoginWhatsappOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            if (user.LoginOtp != request.Otp ||
                user.LoginOtpExpiresAt == null ||
                user.LoginOtpExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            user.LoginOtp = null;
            user.LoginOtpExpiresAt = null;
            user.PendingLoginToken = null;
            user.PendingLoginTokenExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("login/verify-authenticator")]
        public async Task<IActionResult> VerifyLoginAuthenticator(VerifyLoginAuthenticatorDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PendingLoginToken == request.TempLoginToken &&
                u.PendingLoginTokenExpiresAt != null &&
                u.PendingLoginTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired login session." });

            if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
                return BadRequest(new { message = "Authenticator is not configured for this account." });

            var validOtp = _authenticatorService.ValidateOtp(user.AuthenticatorSecretKey, request.Otp);

            if (!validOtp)
                return BadRequest(new { message = "Invalid authenticator OTP." });

            user.PendingLoginToken = null;
            user.PendingLoginTokenExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("forgot-password/request")]
        public async Task<IActionResult> ForgotPasswordRequest(ForgotPasswordRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var challengeToken = Guid.NewGuid().ToString("N");
            user.PasswordResetChallengeToken = challengeToken;
            user.PasswordResetChallengeExpiresAt = DateTime.UtcNow.AddMinutes(10);

            if (request.Method.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                var otp = _otpService.GenerateOtp();
                user.PasswordResetOtp = otp;
                user.PasswordResetOtpExpiresAt = DateTime.UtcNow.AddMinutes(5);

                await _context.SaveChangesAsync();

                await _emailService.SendEmailAsync(
                    user.Email,
                    "CapShop Password Reset OTP",
                    BuildOtpEmailHtml("CapShop Password Reset", otp));

                return Ok(new
                {
                    message = "Password reset OTP sent to your email.",
                    challengeToken,
                    method = "Email"
                });
            }

            if (request.Method.Equals("Authenticator", StringComparison.OrdinalIgnoreCase))
            {
                if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
                {
                    return BadRequest(new { message = "Authenticator is not configured for this account." });
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Enter authenticator OTP to continue password reset.",
                    challengeToken,
                    method = "Authenticator"
                });
            }

            return BadRequest(new { message = "Invalid forgot password method." });
        }

        [HttpPost("forgot-password/verify-email-otp")]
        public async Task<IActionResult> VerifyForgotPasswordEmailOtp(VerifyForgotPasswordEmailOtpDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == normalizedEmail &&
                u.PasswordResetChallengeToken == request.ChallengeToken &&
                u.PasswordResetChallengeExpiresAt != null &&
                u.PasswordResetChallengeExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset session." });

            if (user.PasswordResetOtp != request.Otp ||
                user.PasswordResetOtpExpiresAt == null ||
                user.PasswordResetOtpExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            user.PasswordResetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(10);
            user.PasswordResetOtp = null;
            user.PasswordResetOtpExpiresAt = null;
            user.PasswordResetChallengeToken = null;
            user.PasswordResetChallengeExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Verification successful. You can now reset password.",
                resetToken = user.PasswordResetToken
            });
        }

        [HttpPost("forgot-password/verify-authenticator")]
        public async Task<IActionResult> VerifyForgotPasswordAuthenticator(VerifyForgotPasswordAuthenticatorDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == normalizedEmail &&
                u.PasswordResetChallengeToken == request.ChallengeToken &&
                u.PasswordResetChallengeExpiresAt != null &&
                u.PasswordResetChallengeExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset session." });

            if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
                return BadRequest(new { message = "Authenticator is not configured for this account." });

            var validOtp = _authenticatorService.ValidateOtp(user.AuthenticatorSecretKey, request.Otp);

            if (!validOtp)
                return BadRequest(new { message = "Invalid authenticator OTP." });

            user.PasswordResetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(10);
            user.PasswordResetChallengeToken = null;
            user.PasswordResetChallengeExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Verification successful. You can now reset password.",
                resetToken = user.PasswordResetToken
            });
        }

        [HttpPost("forgot-password/reset")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest(new { message = "New password and confirm password do not match." });

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.ResetToken &&
                u.PasswordResetTokenExpiresAt != null &&
                u.PasswordResetTokenExpiresAt > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset token." });

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully. You can now login." });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new UserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                AddressLine = user.AddressLine,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                RoleName = user.RoleName,
                IsEmailVerified = user.IsEmailVerified,
                TwoFactorEnabled = user.TwoFactorEnabled
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            var normalizedUsername = request.Username.Trim().ToLower();

            var existingUsername = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername && u.Id != userId);

            if (existingUsername != null)
                return BadRequest(new { message = "Username already taken" });

            user.Username = request.Username.Trim();
            user.FullName = request.FullName.Trim();
            user.Phone = request.Phone.Trim();
            user.AvatarUrl = request.AvatarUrl?.Trim();
            user.AddressLine = request.AddressLine?.Trim();
            user.City = request.City?.Trim();
            user.State = request.State?.Trim();
            user.Pincode = request.Pincode?.Trim();

            await _context.SaveChangesAsync();

            return Ok(new UserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                AddressLine = user.AddressLine,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                RoleName = user.RoleName,
                IsEmailVerified = user.IsEmailVerified,
                TwoFactorEnabled = user.TwoFactorEnabled
            });
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest(new { message = "New password and confirm password do not match" });

            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            var validOldPassword = _passwordHasher.VerifyPassword(request.OldPassword, user.PasswordHash);

            if (!validOldPassword)
                return BadRequest(new { message = "Old password is incorrect" });

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize]
        [HttpGet("authenticator/setup")]
        public async Task<IActionResult> GetAuthenticatorSetup()
        {
            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.TwoFactorEnabled && !string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
            {
                return Ok(new AuthenticatorSetupDto
                {
                    IsAlreadyEnabled = true,
                    Message = "Authenticator is already enabled for this account."
                });
            }

            var secret = _authenticatorService.GenerateSecretKey();
            var qrUri = _authenticatorService.GenerateQrCodeUri(user.Email, secret);
            var qrImage = _authenticatorService.GenerateQrCodeImage(qrUri);

            user.PendingAuthenticatorSecret = secret;
            await _context.SaveChangesAsync();

            return Ok(new AuthenticatorSetupDto
            {
                IsAlreadyEnabled = false,
                ManualKey = secret,
                QrCodeUri = qrUri,
                QrCodeImageBase64 = qrImage,
                Message = "Scan the QR code and enter OTP to enable authenticator."
            });
        }

        [Authorize]
        [HttpPost("authenticator/enable")]
        public async Task<IActionResult> EnableAuthenticator(EnableAuthenticatorDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.TwoFactorEnabled && !string.IsNullOrWhiteSpace(user.AuthenticatorSecretKey))
            {
                return BadRequest(new { message = "Authenticator is already enabled." });
            }

            if (string.IsNullOrWhiteSpace(user.PendingAuthenticatorSecret))
                return BadRequest(new { message = "Authenticator setup not initiated." });

            var cleanedOtp = request.Otp?.Replace(" ", "").Replace("-", "");

            var validOtp = _authenticatorService.ValidateOtp(user.PendingAuthenticatorSecret, cleanedOtp);

            if (!validOtp)
                return BadRequest(new { message = "Invalid authenticator OTP." });

            user.AuthenticatorSecretKey = user.PendingAuthenticatorSecret;
            user.PendingAuthenticatorSecret = null;
            user.TwoFactorEnabled = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Authenticator enabled successfully.",
                twoFactorEnabled = true
            });
        }

        [Authorize]
        [HttpPost("authenticator/disable")]
        public async Task<IActionResult> DisableAuthenticator()
        {
            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!user.TwoFactorEnabled)
                return BadRequest(new { message = "Authenticator is already disabled." });

            user.TwoFactorEnabled = false;
            user.AuthenticatorSecretKey = null;
            user.PendingAuthenticatorSecret = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Authenticator disabled successfully.",
                twoFactorEnabled = false
            });
        }
    }
}