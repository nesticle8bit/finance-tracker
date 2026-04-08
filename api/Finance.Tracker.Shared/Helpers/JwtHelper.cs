using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Finance.Tracker.Shared.Helpers
{
    public static class JwtHelper
    {
        public static string Generate(UserUpdateDto user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("-fL4A3jKM3deefPkCns!hv4y-QA*r3XFq*MEf_FKgQp2MbYPtz-7A@737UZ7CT2Z"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: "Finance Tracker API",
                audience: "Finance Tracker UI",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
