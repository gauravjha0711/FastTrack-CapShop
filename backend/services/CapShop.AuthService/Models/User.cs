using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [MaxLength(200)]
        public string? AddressLine { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(10)]
        public string? Pincode { get; set; }

        [Required]
        [MaxLength(20)]
        public string RoleName { get; set; } = "Customer";

        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;

        [MaxLength(10)]
        public string? EmailVerificationOtp { get; set; }

        public DateTime? EmailVerificationOtpExpiresAt { get; set; }

        [MaxLength(10)]
        public string? LoginOtp { get; set; }

        public DateTime? LoginOtpExpiresAt { get; set; }

        [MaxLength(100)]
        public string? PendingLoginToken { get; set; }

        public DateTime? PendingLoginTokenExpiresAt { get; set; }

        public bool TwoFactorEnabled { get; set; } = false;

        [MaxLength(100)]
        public string? AuthenticatorSecretKey { get; set; }

        [MaxLength(100)]
        public string? PendingAuthenticatorSecret { get; set; }

        [MaxLength(100)]
        public string? PasswordResetChallengeToken { get; set; }

        public DateTime? PasswordResetChallengeExpiresAt { get; set; }

        [MaxLength(10)]
        public string? PasswordResetOtp { get; set; }

        public DateTime? PasswordResetOtpExpiresAt { get; set; }

        [MaxLength(100)]
        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}