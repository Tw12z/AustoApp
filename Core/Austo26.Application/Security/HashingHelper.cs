using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;

namespace Austo26.Application.Security;

/// <summary>
/// Password hashing. New hashes use PBKDF2-HMAC-SHA512 with a per-user random
/// salt and a deliberately high iteration count.
///
/// The original scheme here was a single un-iterated HMACSHA512 over the
/// password, keyed with a random value stored as the "salt". That salt does
/// stop a shared rainbow table, but one HMAC round is a handful of nanoseconds
/// on a GPU, so a leaked user table could be brute-forced against common
/// passwords essentially for free. PBKDF2 makes each guess cost
/// <see cref="Iterations"/> rounds instead of one.
///
/// Hashes written before this change are still accepted on login, and
/// <see cref="NeedsUpgrade"/> lets the caller transparently re-hash them with
/// the new scheme once the plaintext is in hand (i.e. at login), so nobody
/// has to reset their password.
/// </summary>
public static class HashingHelper
{
    // OWASP's current floor for PBKDF2-HMAC-SHA512 is 210,000; this sits
    // comfortably above it while still costing only a few hundred ms per login.
    private const int Iterations = 310_000;
    private const int SaltSize   = 32; // bytes
    private const int KeySize    = 64; // bytes, matches SHA-512's output

    // Marks a stored hash as the PBKDF2 format. Legacy HMACSHA512 hashes are
    // exactly 64 bytes, so a 1-byte version prefix keeps the two unambiguous
    // and leaves room for a future third scheme — no schema migration needed,
    // the existing byte[] columns carry it.
    private const byte Pbkdf2Version = 0x01;

    private static readonly HashAlgorithmName Prf = HashAlgorithmName.SHA512;

    public static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
    {
        ArgumentNullException.ThrowIfNull(password);

        salt = RandomNumberGenerator.GetBytes(SaltSize);

        var derived = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, Iterations, Prf, KeySize);

        // [version][iterations (4 bytes, big-endian)][derived key]
        hash = new byte[1 + 4 + KeySize];
        hash[0] = Pbkdf2Version;
        BinaryPrimitives.WriteInt32BigEndian(hash.AsSpan(1, 4), Iterations);
        derived.CopyTo(hash, 5);
    }

    public static bool VerifyPasswordHash(string password, byte[] hash, byte[] salt)
    {
        if (password is null || hash is null || salt is null) return false;

        return IsPbkdf2(hash)
            ? VerifyPbkdf2(password, hash, salt)
            : VerifyLegacyHmac(password, hash, salt);
    }

    /// <summary>
    /// True when the stored hash predates PBKDF2. Call this after a successful
    /// <see cref="VerifyPasswordHash"/> to re-hash the password while you still
    /// have the plaintext, then persist the new hash and salt.
    /// </summary>
    public static bool NeedsUpgrade(byte[] hash) => !IsPbkdf2(hash);

    private static bool IsPbkdf2(byte[] hash) =>
        hash.Length == 1 + 4 + KeySize && hash[0] == Pbkdf2Version;

    private static bool VerifyPbkdf2(string password, byte[] hash, byte[] salt)
    {
        var iterations = BinaryPrimitives.ReadInt32BigEndian(hash.AsSpan(1, 4));
        if (iterations <= 0) return false;

        var expected = hash.AsSpan(5).ToArray();
        var actual = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, iterations, Prf, expected.Length);

        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    // Kept only so existing accounts can still log in (and be upgraded on the
    // way through). Nothing writes this format any more.
    private static bool VerifyLegacyHmac(string password, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        var actual = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return CryptographicOperations.FixedTimeEquals(actual, hash);
    }
}
