using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;

namespace DeMasterProCloud.Common.Infrastructure
{
    public static class CryptographyHelper
    {
        public static string GetHmacH256(string text, string secretKey)
        {
            try
            {
                // Convert the key and message into byte arrays
                var keyBytes = Encoding.UTF8.GetBytes(secretKey);
                var messageBytes = Encoding.UTF8.GetBytes(text);

                // Use HMACSHA256 class to compute the HMAC
                using (var hmacsha256 = new HMACSHA256(keyBytes))
                {
                    var hashBytes = hmacsha256.ComputeHash(messageBytes);
                    return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
                }
            }
            catch (Exception ex)
            {
                var logger = ApplicationVariables.LoggerFactory.CreateLogger(typeof(CryptographyHelper));
                logger.LogError(ex, "Error in GetHmacH256");
                return null;
            }
        }
        
        public static bool VerifyHmacSha256Hash(string key, string message, string expectedHmac)
        {
            try
            {
                string computedHmac = GetHmacH256(message, key);

                // Securely compare the two HMACs
                return AreEqual(computedHmac, expectedHmac);
            }
            catch (Exception ex)
            {
                var logger = ApplicationVariables.LoggerFactory.CreateLogger(typeof(CryptographyHelper));
                logger.LogError(ex, "Error in VerifyHmacSha256Hash");
                return false;
            }
        }

        private static bool AreEqual(string a, string b)
        {
            // Ensure constant-time comparison to avoid timing attacks
            if (a.Length != b.Length)
                return false;

            int result = 0;
            for (int i = 0; i < a.Length; i++)
            {
                result |= a[i] ^ b[i];
            }

            return result == 0;
        }
    }
}