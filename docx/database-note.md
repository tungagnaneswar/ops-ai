# OpsAI — Database Design Notes
**Project**: AI-Powered Incident & Operations Platform
**Database**: PostgreSQL
**Schema File**: [`schema.sql`](file:///d:/ops-ai/schema.sql)
**Version**: 3.0 | **Last Updated**: 2026-10-04

---

## Architecture Overview

> [!IMPORTANT]
> This project uses a **Microservices Architecture** with **PostgreSQL** — each service owns its own isolated database.
> - **PostgreSQL does NOT support `USE database`** — each database requires a separate connection (`\c dbname` in psql).
> - **Cross-service relationships** are **LOGICAL** — we store the ID but do NOT enforce a `FOREIGN KEY` constraint across databases (each DB lives in its own container).
> - **Internal relationships** (within the same DB) use **strict `FOREIGN KEY` constraints** with `ON DELETE CASCADE`.

---

## SOLID Principles Applied

**Single Responsibility** — Each table represents one and only one entity. No "god tables".

**Open/Closed** — Linking tables like `user_roles` and `incident_tag_map` allow extending relationships without modifying core tables.

**Liskov Substitution** — Generic structures like `audit_logs` with JSONB `metadata` can accept any event type uniformly.

**Interface Segregation** — Tables expose only relevant columns; each service queries only what it owns.

**Dependency Inversion** — Stable core tables (`users`, `teams`) do not depend on volatile feature tables (`incidents`, `ai_analyses`). Dependencies flow towards stability.

---

## Databases Overview

There are **7 databases** across **7 microservices** totalling **25 tables**.

- `opsai_auth` → auth-service (Port 8081)
- `opsai_teams` → team-service (Port 8083)
- `opsai_incident` → incident-service (Port 8082)
- `opsai_notification` → notification-service (Port 8084)
- `opsai_audit` → audit-service (Port 8085)
- `opsai_ai` → ai-service (Port 8086)
- `opsai_event` → event-simulator (Port 8087)

---

## 1. `opsai_auth` — Authentication & Authorization Service

Handles everything related to identity — who users are, what roles they have, what they are permitted to do, and their active sessions.

### `users`
The central identity table. Stores login credentials, profile info, and account status. The `public_id` is a UUID generated automatically and is what all external APIs expose — the internal `id` (BIGSERIAL) is never shared outside the service. `status` is a typed ENUM: `ACTIVE`, `INACTIVE`, or `SUSPENDED`. `last_login_at` is updated on every successful login. `updated_at` is auto-managed by the `set_updated_at()` trigger.

### `roles`
Defines named roles in the system such as `ADMIN`, `ENGINEER`, or `VIEWER`. Each role has a unique name and an optional description. Roles are referenced by `user_roles` and `permissions`.

### `user_roles`
A linking table implementing the Many-to-Many relationship between `users` and `roles`. A user can hold multiple roles simultaneously. The composite primary key is `(user_id, role_id)`. Both foreign keys cascade on delete, so removing a user or role automatically removes the mapping.

### `permissions`
Stores fine-grained access control rules per role. Each row defines a `resource` (e.g., `incidents`, `teams`) and an `action` (e.g., `read`, `write`, `delete`). A unique constraint on `(role_id, resource, action)` prevents duplicate entries.

### `sessions`
Tracks active JWT refresh tokens. Each row is linked to a user and holds the hashed refresh token, client IP address, user agent, and expiry time. Records are deleted when the user logs out or the token expires. A scheduled cleanup job should periodically purge expired rows.

---

## 2. `opsai_teams` — Team Service

Manages the organizational grouping of users into teams, which are then assigned to incidents.

### `teams`
Represents a team in the system. Has a unique name, optional description, and a `created_by` field which is a logical reference to `opsai_auth.users.id`. The `public_id` UUID is auto-generated.

### `team_members`
Implements the Many-to-Many relationship between teams and users. Each row records which user belongs to which team, their `role_in_team` (ENUM: `LEAD`, `MEMBER`, `OBSERVER`), and when they joined. The `user_id` is a logical cross-service reference to `opsai_auth.users.id`.

---

## 3. `opsai_incident` — Incident Service

The core of the platform. Manages the complete lifecycle of incidents from creation to resolution.

### `incidents`
The primary table of the entire platform. Every incident has a `status` (ENUM: `OPEN`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`), a `severity` (ENUM: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and a `priority` (ENUM: `P1`, `P2`, `P3`, `P4`). The `source` field records how the incident was detected — whether created `MANUAL`ly, by `AI_DETECTED`, via `EVENT_SIMULATOR`, an `ALERT`, or `EXTERNAL` system. The `reporter_id` and `assignee_id` are logical references to `opsai_auth.users.id`. The `team_id` is a logical reference to `opsai_teams.teams.id`. The `ai_summary` field is populated by the ai-service after analysis. `resolved_at` is set when status transitions to `RESOLVED`. Indexed on `status`, `severity`, `assignee_id`, and `team_id` for fast filtering.

### `incident_comments`
A discussion thread on an incident. Supports both public comments and internal notes via the `is_internal` boolean flag. Internal notes are only visible to team members. `author_id` is a logical reference to `opsai_auth.users.id`. Cascades on incident delete.

### `incident_history`
An append-only log of every field change on an incident. Records `field_changed` (e.g., `status`, `assignee_id`), `old_value`, and `new_value` as text. `changed_by_id` is a logical reference to `opsai_auth.users.id`. This table is never updated — only inserted into.

### `incident_tags` and `incident_tag_map`
`incident_tags` is a simple lookup table of tag names (e.g., `network`, `database`, `security`). `incident_tag_map` is the Many-to-Many linking table that associates incidents with their tags. Both sides cascade on delete.

---

## 4. `opsai_notification` — Notification Service

Responsible for dispatching, tracking, and configuring all system notifications across multiple channels.

### `notifications`
Every notification ever sent by the system is recorded here. Each row knows which user it targets (`user_id`), what triggered it (`event_type`, e.g., `INCIDENT_ASSIGNED`), which `channel` was used (ENUM: `EMAIL`, `SLACK`, `WEBHOOK`, `IN_APP`, `SMS`), and its delivery `status` (ENUM: `PENDING`, `SENT`, `FAILED`, `READ`). `sent_at` is set when delivery is confirmed. `read_at` is set when the user reads an in-app notification. Indexed on `user_id` and `status`.

### `notification_preferences`
One row per user. Controls which delivery channels are enabled for them — `email_enabled`, `slack_enabled`, `sms_enabled`, and `in_app_enabled` are boolean flags. More granular per-event-type overrides can be stored in the `event_preferences` JSONB column.

### `notification_channels`
Stores configurable outgoing webhook and integration endpoints set up by users — such as Slack webhooks, PagerDuty API keys, or custom webhook URLs. The `channel_type` is an ENUM: `SLACK`, `WEBHOOK`, `PAGERDUTY`, `EMAIL`. The `config` JSONB column holds the actual credentials and endpoint details. An `is_active` flag allows disabling a channel without deleting it.

---

## 5. `opsai_audit` — Audit Service

A dedicated, immutable record of every significant action that occurs across the platform.

### `audit_logs`

> [!CAUTION]
> This table is **APPEND-ONLY**. Rows must **NEVER** be updated or deleted. It is the source of truth for compliance and forensic investigation.

Every service publishes events to this log. Each row stores the `event_type` (e.g., `USER_LOGIN`, `INCIDENT_STATUS_CHANGED`), the `user_id` who triggered it (NULL for system-generated events), the `service_name` that emitted it, the affected `resource_type` and `resource_id`, and the `old_value` / `new_value` as JSONB for full state diffing. An additional `metadata` JSONB column holds any extra context. Indexed heavily on `user_id`, `event_type`, `(resource_type, resource_id)`, and `created_at` for fast querying and reporting.

---

## 6. `opsai_ai` — AI Service

Stores all AI inference results and the prompt templates that drive them.

### `ai_prompt_templates`
Versioned, reusable prompt blueprints. Each template has a `task_type` (ENUM: `CLASSIFICATION`, `SUMMARY`, `ROOT_CAUSE`, `RECOMMENDATION`) and a `template` text body with `{{variable}}` placeholders for dynamic values. A `version` integer is incremented when the template is updated. Only templates where `is_active = TRUE` are used by the service.

### `ai_analyses`
Stores every AI inference result linked to an incident. Records the `incident_id` (logical ref to `opsai_incident.incidents.id`), the `analysis_type`, which `model_used` (e.g., `gemini-2.0-flash`), the exact `input_context` sent to the model, the `result` text returned, a `confidence_score` as `NUMERIC(5,4)` (0.0000 to 1.0000), and the `tokens_used` for cost tracking. The `prompt_id` references `ai_prompt_templates` with `ON DELETE SET NULL` so deleting a template doesn't destroy the analysis record.

---

## 7. `opsai_event` — Event Simulator Service

Generates and tracks synthetic system events used for testing and demonstration purposes.

### `event_templates`
Pre-built blueprints for common failure scenarios such as `CPU_SPIKE`, `DB_TIMEOUT`, or `NETWORK_LOSS`. Each template defines the `event_type`, default `severity` (ENUM: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), and a `payload` JSONB with the default data structure. Inactive templates (`is_active = FALSE`) are hidden from the simulation UI.

### `simulated_events`
A record of every event actually fired by the simulator. Stores the `template_id` used (nullable — NULL means it was a custom one-off event), the actual `payload` dispatched, `triggered_by` (logical ref to `opsai_auth.users.id`), and the processing `status` (ENUM: `SENT`, `PROCESSING`, `PROCESSED`, `FAILED`). The `incident_id` field is populated if this simulated event resulted in the creation of an incident in `opsai_incident`.

---

## Cross-Service Relationship Map

```
opsai_auth.users
    │
    ├── opsai_teams.team_members.user_id              (User belongs to a Team)
    ├── opsai_incident.incidents.reporter_id          (User reported an Incident)
    ├── opsai_incident.incidents.assignee_id          (User assigned to an Incident)
    ├── opsai_incident.incident_comments.author_id
    ├── opsai_incident.incident_history.changed_by_id
    ├── opsai_notification.notifications.user_id
    ├── opsai_notification.notification_preferences.user_id
    ├── opsai_audit.audit_logs.user_id
    └── opsai_event.simulated_events.triggered_by

opsai_teams.teams
    └── opsai_incident.incidents.team_id              (Team owns an Incident)

opsai_incident.incidents
    ├── opsai_ai.ai_analyses.incident_id              (AI analysis on an Incident)
    └── opsai_event.simulated_events.incident_id      (Event that spawned the Incident)
```

> [!NOTE]
> All arrows above are **logical references** — stored ID only, no database-level `FOREIGN KEY` across database boundaries. Integrity is enforced at the application/service layer.

---

## Design Conventions (PostgreSQL)

**Primary Key** — Always `BIGSERIAL PRIMARY KEY` named `id`. This is PostgreSQL's auto-incrementing integer type.

**Public API ID** — Always `UUID` named `public_id` with `DEFAULT gen_random_uuid()`. The internal `id` is never exposed in API responses.

**Timestamps** — All timestamps use `TIMESTAMPTZ` (timezone-aware). All tables have `created_at`. Mutable tables also have `updated_at` managed automatically by the `set_updated_at()` PL/pgSQL trigger function, which is re-created in each database.

**ENUM Types** — Defined as named types using `CREATE TYPE name AS ENUM (...)` before the table definition. Each database manages its own type namespace.

**Indexes** — Defined as standalone `CREATE INDEX` statements after the table creation. Named with the prefix `idx_`.

**JSON Columns** — Always use `JSONB` (binary JSON) rather than plain `JSON`. JSONB is faster for reads and supports GIN indexing.

**Cascade Rules** — `ON DELETE CASCADE` for all mandatory internal FK relationships. `ON DELETE SET NULL` for optional links where the child should survive the parent's deletion.

**Soft Deletes** — Where data must be preserved for audit/history, use a `status` ENUM field instead of hard-deleting rows.

**Connecting to Databases** — Use `\c dbname` in psql, or configure a separate `spring.datasource.url` (or equivalent) per microservice. There is no `USE` statement in PostgreSQL.
