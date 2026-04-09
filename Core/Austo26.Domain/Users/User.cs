using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Users;

public enum UserRole { Admin = 1, Staff = 2 }

public class User : BaseEntity
{
    public string FullName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string UserName { get; private set; } = null!;
    public byte[] PasswordHash { get; private set; } = null!;
    public byte[] PasswordSalt { get; private set; } = null!;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public string? EmailVerificationToken { get; private set; }
    public DateTime? EmailVerificationTokenExpiry { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenEndDate { get; private set; }

    protected User() { }

    public User(string fullName, string userName, string email,
                byte[] passwordHash, byte[] passwordSalt, UserRole role)
    {
        SetFullName(fullName);
        SetUserName(userName);
        SetEmail(email);
        PasswordHash = passwordHash;
        PasswordSalt = passwordSalt;
        Role = role;
        IsActive = true;
        IsEmailVerified = false;
    }

    public void ChangeName(string fullName) { SetFullName(fullName); Touch(); }
    public void ChangeRole(UserRole role) { Role = role; Touch(); }
    public void Deactivate() { IsActive = false; Touch(); }
    public void Activate() { IsActive = true; Touch(); }

    public void SetEmailVerificationToken(string token, DateTime expiry)
    {
        EmailVerificationToken = token;
        EmailVerificationTokenExpiry = expiry;
        Touch();
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        EmailVerificationToken = null;
        EmailVerificationTokenExpiry = null;
        Touch();
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
        Touch();
    }

    public void ResetPassword(byte[] hash, byte[] salt)
    {
        PasswordHash = hash;
        PasswordSalt = salt;
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        Touch();
    }

    public void UpdateRefreshToken(string refreshToken, DateTime endDate)
    {
        RefreshToken = refreshToken;
        RefreshTokenEndDate = endDate;
        Touch();
    }

    public void SetFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("İsim boş olamaz.", nameof(fullName));
        FullName = fullName.Trim();
    }

    public void SetUserName(string userName)
    {
        if (string.IsNullOrWhiteSpace(userName)) throw new ArgumentException("Kullanıcı adı boş olamaz.", nameof(userName));
        UserName = userName.Trim();
    }

    public void SetEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email boş olamaz.", nameof(email));
        Email = email.Trim();
    }
}
