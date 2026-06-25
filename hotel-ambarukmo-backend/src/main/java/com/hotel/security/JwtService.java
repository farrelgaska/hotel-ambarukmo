package com.hotel.security;

import com.hotel.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final Map<String, RefreshTokenEntry> refreshTokens = new ConcurrentHashMap<>();

    private record RefreshTokenEntry(String username, Date expiresAt) {}

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateAccessToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiration());

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        String refreshToken = UUID.randomUUID().toString();
        Date expiresAt = new Date(System.currentTimeMillis() + jwtProperties.getRefreshTokenExpiration());
        refreshTokens.put(refreshToken, new RefreshTokenEntry(username, expiresAt));
        return refreshToken;
    }

    public String refreshAccessToken(String refreshToken) {
        RefreshTokenEntry entry = refreshTokens.get(refreshToken);
        if (entry == null || entry.expiresAt().before(new Date())) {
            refreshTokens.remove(refreshToken);
            throw new com.hotel.exception.UnauthorizedException("Invalid or expired refresh token");
        }
        return entry.username();
    }

    public void invalidateRefreshToken(String refreshToken) {
        if (refreshToken != null) {
            refreshTokens.remove(refreshToken);
        }
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token, String username) {
        String tokenUsername = extractUsername(token);
        return tokenUsername.equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
