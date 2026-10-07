package com.opsai.auth.service;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.SessionResponse;
import com.opsai.auth.model.Session;
import com.opsai.auth.model.User;
import com.opsai.auth.repository.SessionRepository;
import com.opsai.auth.repository.UserRepository;
import com.opsai.auth.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionServiceImpl implements SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionServiceImpl.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Autowired
    public SessionServiceImpl(SessionRepository sessionRepository,
                              UserRepository userRepository,
                              JwtService jwtService) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public Session createSession(User user, HttpServletRequest request) {
        String refreshToken = generateSecureToken();
        String clientIp = extractClientIp(request);
        String userAgent = extractUserAgent(request);

        OffsetDateTime expiresAt = OffsetDateTime.now().plusDays(30);

        Session session = new Session(user, refreshToken, clientIp, userAgent, expiresAt);
        return sessionRepository.save(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getUserSessions(Long userId, String currentRefreshToken) {
        List<Session> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        OffsetDateTime now = OffsetDateTime.now();

        return sessions.stream()
                .filter(s -> s.getExpiresAt().isAfter(now))
                .map(s -> {
                    ParsedUserAgent parsedUa = parseUserAgent(s.getUserAgent());
                    boolean isCurrent = (currentRefreshToken != null && currentRefreshToken.equals(s.getRefreshToken()));
                    
                    return new SessionResponse(
                            s.getId(),
                            s.getIpAddress(),
                            s.getUserAgent(),
                            parsedUa.browser,
                            parsedUa.os,
                            parsedUa.device,
                            s.getCreatedAt(),
                            s.getExpiresAt(),
                            isCurrent
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken, HttpServletRequest request) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        Session session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (session.getExpiresAt().isBefore(OffsetDateTime.now())) {
            sessionRepository.delete(session);
            throw new IllegalArgumentException("Refresh token has expired. Please log in again.");
        }

        User user = session.getUser();
        String newAccessToken = jwtService.generateJwtTokenFromUsername(user.getUsername());

        // Update IP and user-agent if client moved
        if (request != null) {
            session.setIpAddress(extractClientIp(request));
            session.setUserAgent(extractUserAgent(request));
            sessionRepository.save(session);
        }

        return new AuthResponse(
                newAccessToken,
                session.getRefreshToken(),
                session.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    @Override
    @Transactional
    public void revokeSession(Long userId, Long sessionId) {
        Session session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found or does not belong to user"));
        sessionRepository.delete(session);
    }

    @Override
    @Transactional
    public void revokeAllOtherSessions(Long userId, String currentRefreshToken) {
        if (currentRefreshToken != null && !currentRefreshToken.isBlank()) {
            sessionRepository.deleteByUserIdAndRefreshTokenNot(userId, currentRefreshToken);
        } else {
            sessionRepository.deleteByUserId(userId);
        }
    }

    @Override
    @Transactional
    public void logout(String refreshToken, Long userId) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            sessionRepository.deleteByRefreshToken(refreshToken);
        } else if (userId != null) {
            sessionRepository.deleteByUserId(userId);
        }
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // 3:00 AM daily cleanup
    @Transactional
    public void cleanupExpiredSessions() {
        logger.info("Running scheduled cleanup of expired sessions...");
        sessionRepository.deleteByExpiresAtBefore(OffsetDateTime.now());
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes) + UUID.randomUUID().toString().replace("-", "");
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";

        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        ip = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip != null ? ip : "127.0.0.1";
    }

    private String extractUserAgent(HttpServletRequest request) {
        if (request == null) return "Unknown Client";
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua : "Unknown Client";
    }

    private ParsedUserAgent parseUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return new ParsedUserAgent("Browser", "Unknown OS", "Desktop");
        }
        String ua = userAgent.toLowerCase();

        // OS detection
        String os = "Unknown OS";
        if (ua.contains("windows nt 10.0") || ua.contains("windows nt 11.0") || ua.contains("windows")) {
            os = "Windows";
        } else if (ua.contains("mac os x") || ua.contains("macintosh")) {
            os = "macOS";
        } else if (ua.contains("android")) {
            os = "Android";
        } else if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod")) {
            os = "iOS";
        } else if (ua.contains("linux")) {
            os = "Linux";
        }

        // Browser detection
        String browser = "Browser";
        if (ua.contains("edg/") || ua.contains("edge/")) {
            browser = "Edge";
        } else if (ua.contains("chrome/") && !ua.contains("edg/")) {
            browser = "Chrome";
        } else if (ua.contains("firefox/")) {
            browser = "Firefox";
        } else if (ua.contains("safari/") && !ua.contains("chrome/")) {
            browser = "Safari";
        } else if (ua.contains("postman")) {
            browser = "Postman";
        } else if (ua.contains("curl")) {
            browser = "cURL";
        }

        // Device type
        String device = (os.equals("Android") || os.equals("iOS") || ua.contains("mobile")) ? "Mobile" : "Desktop";

        return new ParsedUserAgent(browser, os, device);
    }

    private static class ParsedUserAgent {
        final String browser;
        final String os;
        final String device;

        ParsedUserAgent(String browser, String os, String device) {
            this.browser = browser;
            this.os = os;
            this.device = device;
        }
    }
}
