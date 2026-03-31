using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CapShop.AuthService.Services
{
    public class SmsService
    {
        private readonly IConfiguration _configuration;

        public SmsService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void SendOtp(string phone, string otp)
        {
            var accountSid = _configuration["SmsSettings:AccountSid"];
            var authToken = _configuration["SmsSettings:AuthToken"];
            var fromNumber = _configuration["SmsSettings:FromPhoneNumber"];

            if (string.IsNullOrWhiteSpace(accountSid) ||
                string.IsNullOrWhiteSpace(authToken) ||
                string.IsNullOrWhiteSpace(fromNumber))
            {
                throw new InvalidOperationException("SmsSettings are not configured properly.");
            }

            if (string.IsNullOrWhiteSpace(phone))
            {
                throw new ArgumentException("Phone number is required.");
            }

            phone = NormalizePhone(phone);

            TwilioClient.Init(accountSid, authToken);

            MessageResource.Create(
                body: $"CapShop OTP: {otp}. Valid for 5 minutes. Do not share this code.",
                from: new PhoneNumber(fromNumber),
                to: new PhoneNumber(phone)
            );
        }

        public void SendWhatsAppOtp(string phone, string otp)
        {
            var accountSid = _configuration["SmsSettings:AccountSid"];
            var authToken = _configuration["SmsSettings:AuthToken"];
            var fromWhatsappNumber = _configuration["SmsSettings:FromWhatsappNumber"];

            if (string.IsNullOrWhiteSpace(accountSid) ||
                string.IsNullOrWhiteSpace(authToken) ||
                string.IsNullOrWhiteSpace(fromWhatsappNumber))
            {
                throw new InvalidOperationException("SmsSettings WhatsApp configuration is missing.");
            }

            if (string.IsNullOrWhiteSpace(phone))
            {
                throw new ArgumentException("Phone number is required.");
            }

            var normalizedPhone = NormalizePhone(phone);

            TwilioClient.Init(accountSid, authToken);

            MessageResource.Create(
                body: $"CapShop OTP: {otp}. Valid for 5 minutes. Do not share this code.",
                from: new PhoneNumber(fromWhatsappNumber),
                to: new PhoneNumber($"whatsapp:{normalizedPhone}")
            );
        }

        private static string NormalizePhone(string phone)
        {
            var normalizedPhone = phone.Trim();

            if (!normalizedPhone.StartsWith("+"))
            {
                normalizedPhone = "+91" + normalizedPhone;
            }

            return normalizedPhone;
        }
    }
}