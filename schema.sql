-- =============================================================================
-- OpsAI — AI-Powered Incident & Operations Platform
-- Complete Database Schema — PostgreSQL
-- Version: 3.0
-- Generated: 2026-10-04
--
-- IMPORTANT: PostgreSQL does NOT support "USE database".
-- Each section below must be run against its respective database.
-- 
-- Step 1: Connect as superuser and run the CREATE DATABASE block.
-- Step 2: Connect to each database separately and run its section.
--
-- Cross-service relations are LOGICAL (stored ID, no FK constraint)
-- because each DB lives in its own container / connection.
-- Internal relations (within the same DB) use strict FOREIGN KEYS.
-- =============================================================================


-- =============================================================================
-- STEP 1: Create all databases (run as superuser / postgres user)
-- =============================================================================
CREATE DATABASE opsai_auth;
CREATE DATABASE opsai_teams;
CREATE DATABASE opsai_incident;
CREATE DATABASE opsai_notification;
CREATE DATABASE opsai_audit;
CREATE DATABASE opsai_ai;
CREATE DATABASE opsai_event;


-- =============================================================================
-- STEP 2A: Connect to opsai_auth — then run the following:
-- \c opsai_auth
-- =============================================================================

-- Shared trigger function: auto-updates updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ENUM Types
CREATE TYPE user_status      AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE team_role        AS ENUM ('LEAD', 'MEMBER', 'OBSERVER');

-- Core user accounts
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    public_id     UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    first_name    VARCHAR(50),
    last_name     VARCHAR(50),
    avatar_url    VARCHAR(500),
    status        user_status  NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Roles available in the system (ADMIN, ENGINEER, VIEWER, etc.)
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    public_id   UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Many-to-Many: Users can have multiple roles
CREATE TABLE user_roles (
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     BIGINT      NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Fine-grained permissions per role (e.g. incidents:write, teams:read)
CREATE TABLE permissions (
    id         BIGSERIAL   PRIMARY KEY,
    role_id    BIGINT      NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource   VARCHAR(100) NOT NULL,
    action     VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, resource, action)
);

-- Active user sessions / JWT refresh tokens
CREATE TABLE sessions (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) NOT NULL UNIQUE,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    expires_at    TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);


-- =============================================================================
-- STEP 2B: Connect to opsai_teams — then run the following:
-- \c opsai_teams
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE team_role AS ENUM ('LEAD', 'MEMBER', 'OBSERVER');

-- Organizational teams
CREATE TABLE teams (
    id          BIGSERIAL    PRIMARY KEY,
    public_id   UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by  BIGINT       NOT NULL,                -- Logical ref: opsai_auth.users.id
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Team membership — which users belong to which team
CREATE TABLE team_members (
    team_id      BIGINT    NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id      BIGINT    NOT NULL,                  -- Logical ref: opsai_auth.users.id
    role_in_team team_role NOT NULL DEFAULT 'MEMBER',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);


-- =============================================================================
-- STEP 2C: Connect to opsai_incident — then run the following:
-- \c opsai_incident
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE incident_status   AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED');
CREATE TYPE incident_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE incident_priority AS ENUM ('P1', 'P2', 'P3', 'P4');
CREATE TYPE incident_source   AS ENUM ('MANUAL', 'AI_DETECTED', 'EVENT_SIMULATOR', 'ALERT', 'EXTERNAL');

-- Core incident records
CREATE TABLE incidents (
    id           BIGSERIAL         PRIMARY KEY,
    public_id    UUID              NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    title        VARCHAR(255)      NOT NULL,
    description  TEXT,
    status       incident_status   NOT NULL DEFAULT 'OPEN',
    severity     incident_severity NOT NULL DEFAULT 'MEDIUM',
    priority     incident_priority NOT NULL DEFAULT 'P3',
    source       incident_source            DEFAULT 'MANUAL',
    reporter_id  BIGINT            NOT NULL,           -- Logical ref: opsai_auth.users.id
    assignee_id  BIGINT,                               -- Logical ref: opsai_auth.users.id
    team_id      BIGINT,                               -- Logical ref: opsai_teams.teams.id
    ai_summary   TEXT,
    resolved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_incidents_updated_at
    BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_incidents_status   ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_assignee ON incidents(assignee_id);
CREATE INDEX idx_incidents_team     ON incidents(team_id);

-- Comments / notes on an incident
CREATE TABLE incident_comments (
    id          BIGSERIAL   PRIMARY KEY,
    incident_id BIGINT      NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id   BIGINT      NOT NULL,                 -- Logical ref: opsai_auth.users.id
    content     TEXT        NOT NULL,
    is_internal BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_incident_comments_updated_at
    BEFORE UPDATE ON incident_comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_comments_incident ON incident_comments(incident_id);

-- Immutable history of all state changes on an incident
CREATE TABLE incident_history (
    id            BIGSERIAL    PRIMARY KEY,
    incident_id   BIGINT       NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    changed_by_id BIGINT       NOT NULL,              -- Logical ref: opsai_auth.users.id
    field_changed VARCHAR(100) NOT NULL,
    old_value     TEXT,
    new_value     TEXT,
    changed_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_history_incident ON incident_history(incident_id);

-- Tags for categorizing incidents
CREATE TABLE incident_tags (
    id   BIGSERIAL    PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Many-to-Many: incidents can have multiple tags
CREATE TABLE incident_tag_map (
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    tag_id      BIGINT NOT NULL REFERENCES incident_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, tag_id)
);


-- =============================================================================
-- STEP 2D: Connect to opsai_notification — then run the following:
-- \c opsai_notification
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SLACK', 'WEBHOOK', 'IN_APP', 'SMS');
CREATE TYPE notification_status  AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');
CREATE TYPE channel_type         AS ENUM ('SLACK', 'WEBHOOK', 'PAGERDUTY', 'EMAIL');

-- Every notification dispatched by the system
CREATE TABLE notifications (
    id            BIGSERIAL            PRIMARY KEY,
    public_id     UUID                 NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    user_id       BIGINT               NOT NULL,       -- Logical ref: opsai_auth.users.id
    event_type    VARCHAR(100)         NOT NULL,
    resource_type VARCHAR(100),
    resource_id   BIGINT,
    title         VARCHAR(255)         NOT NULL,
    message       TEXT                 NOT NULL,
    channel       notification_channel NOT NULL,
    status        notification_status  NOT NULL DEFAULT 'PENDING',
    sent_at       TIMESTAMPTZ,
    read_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ          NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Per-user notification preferences
CREATE TABLE notification_preferences (
    id                BIGSERIAL   PRIMARY KEY,
    user_id           BIGINT      NOT NULL UNIQUE,     -- Logical ref: opsai_auth.users.id
    email_enabled     BOOLEAN     NOT NULL DEFAULT TRUE,
    slack_enabled     BOOLEAN     NOT NULL DEFAULT FALSE,
    sms_enabled       BOOLEAN     NOT NULL DEFAULT FALSE,
    in_app_enabled    BOOLEAN     NOT NULL DEFAULT TRUE,
    event_preferences JSONB,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_notification_prefs_updated_at
    BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Configured outgoing webhook/channel endpoints
CREATE TABLE notification_channels (
    id           BIGSERIAL    PRIMARY KEY,
    public_id    UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    owner_id     BIGINT       NOT NULL,                -- Logical ref: opsai_auth.users.id
    channel_type channel_type NOT NULL,
    name         VARCHAR(100) NOT NULL,
    config       JSONB        NOT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_notification_channels_updated_at
    BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- STEP 2E: Connect to opsai_audit — then run the following:
-- \c opsai_audit
-- =============================================================================

-- Append-only audit log — NEVER update or delete rows here
CREATE TABLE audit_logs (
    id            BIGSERIAL    PRIMARY KEY,
    public_id     UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    event_type    VARCHAR(100) NOT NULL,
    user_id       BIGINT,                              -- Logical ref: opsai_auth.users.id (NULL = system)
    service_name  VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id   VARCHAR(100),
    ip_address    VARCHAR(45),
    old_value     JSONB,
    new_value     JSONB,
    metadata      JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_user          ON audit_logs(user_id);
CREATE INDEX idx_audit_event_type    ON audit_logs(event_type);
CREATE INDEX idx_audit_resource      ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created_at    ON audit_logs(created_at);


-- =============================================================================
-- STEP 2F: Connect to opsai_ai — then run the following:
-- \c opsai_ai
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE ai_task_type       AS ENUM ('CLASSIFICATION', 'SUMMARY', 'ROOT_CAUSE', 'RECOMMENDATION');
CREATE TYPE ai_analysis_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- Versioned, reusable prompt templates
CREATE TABLE ai_prompt_templates (
    id          BIGSERIAL    PRIMARY KEY,
    public_id   UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    task_type   ai_task_type NOT NULL,
    template    TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     INT          NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_ai_prompt_templates_updated_at
    BEFORE UPDATE ON ai_prompt_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- AI-generated analyses linked to incidents
CREATE TABLE ai_analyses (
    id               BIGSERIAL          PRIMARY KEY,
    public_id        UUID               NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    incident_id      BIGINT             NOT NULL, -- Logical ref: opsai_incident.incidents.id
    analysis_type    ai_task_type       NOT NULL,
    model_used       VARCHAR(100),
    prompt_id        BIGINT             REFERENCES ai_prompt_templates(id) ON DELETE SET NULL,
    input_context    TEXT,
    result           TEXT               NOT NULL,
    confidence_score NUMERIC(5, 4),               -- 0.0000 to 1.0000
    tokens_used      INT,
    status           ai_analysis_status NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_ai_analyses_updated_at
    BEFORE UPDATE ON ai_analyses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_ai_analyses_incident ON ai_analyses(incident_id);
CREATE INDEX idx_ai_analyses_type     ON ai_analyses(analysis_type);


-- =============================================================================
-- STEP 2G: Connect to opsai_event — then run the following:
-- \c opsai_event
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE event_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE event_status   AS ENUM ('SENT', 'PROCESSING', 'PROCESSED', 'FAILED');

-- Reusable templates for generating events
CREATE TABLE event_templates (
    id          BIGSERIAL      PRIMARY KEY,
    public_id   UUID           NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    name        VARCHAR(100)   NOT NULL UNIQUE,
    description TEXT,
    event_type  VARCHAR(100)   NOT NULL,
    severity    event_severity NOT NULL DEFAULT 'MEDIUM',
    payload     JSONB          NOT NULL,
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_event_templates_updated_at
    BEFORE UPDATE ON event_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Individual simulated events that have been fired
CREATE TABLE simulated_events (
    id           BIGSERIAL      PRIMARY KEY,
    public_id    UUID           NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    template_id  BIGINT         REFERENCES event_templates(id) ON DELETE SET NULL,
    event_type   VARCHAR(100)   NOT NULL,
    severity     event_severity NOT NULL DEFAULT 'MEDIUM',
    source       VARCHAR(100),
    payload      JSONB          NOT NULL,
    triggered_by BIGINT,                              -- Logical ref: opsai_auth.users.id
    status       event_status   NOT NULL DEFAULT 'SENT',
    incident_id  BIGINT,                              -- Logical ref: opsai_incident.incidents.id
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sim_events_type   ON simulated_events(event_type);
CREATE INDEX idx_sim_events_status ON simulated_events(status);
