package com.opsai.auth.dto;

import java.time.OffsetDateTime;

public class SessionResponse {
    private Long id;
    private String ipAddress;
    private String userAgent;
    private String browser;
    private String os;
    private String device;
    private OffsetDateTime createdAt;
    private OffsetDateTime expiresAt;
    private boolean current;

    public SessionResponse() {
    }

    public SessionResponse(Long id, String ipAddress, String userAgent, String browser, String os, String device, OffsetDateTime createdAt, OffsetDateTime expiresAt, boolean current) {
        this.id = id;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.browser = browser;
        this.os = os;
        this.device = device;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.current = current;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getBrowser() {
        return browser;
    }

    public void setBrowser(String browser) {
        this.browser = browser;
    }

    public String getOs() {
        return os;
    }

    public void setOs(String os) {
        this.os = os;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isCurrent() {
        return current;
    }

    public void setCurrent(boolean current) {
        this.current = current;
    }
}
