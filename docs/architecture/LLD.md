# CareerPilot AI - Low Level Design (LLD)

This document provides detailed software specifications, design patterns, and interaction diagrams for the core features of the system.

---

## 1. Authentication & Session Management
CareerPilot AI implements a strict token rotation strategy utilizing short-lived Access Tokens (JWT, HTTP-only cookie or authorization header) and long-lived Refresh Tokens (stored in DB with rotation flags).

### Sequence Diagram: Token Refresh Rotation

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    participant GW as API Gateway (Auth Middleware)
    participant DB as MongoDB (Users Collection)

    Client->>GW: POST /api/auth/refresh (Sends Refresh Token)
    GW->>DB: Find active session with token
    alt Token not found or already used/revoked
        GW->>DB: Revoke all refresh tokens for that user (potential breach detection)
        GW-->>Client: 401 Unauthorized (Force Logout)
    else Token is valid & not expired
        GW->>DB: Invalidate current Refresh Token
        GW->>GW: Generate new Access Token (expires in 15m)
        GW->>GW: Generate new Refresh Token (expires in 7d)
        GW->>DB: Save new Refresh Token in active list
        GW-->>Client: Return new Access & Refresh tokens (Rotate cookies)
    end
```

---

## 2. Multi-Agent AI Gateway System
All queries to the Gemini API flow through the `AIGateway` to ensure caching, validation, JSON response format integrity, and retry fallback loops.

### Component Design & Orchestration Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client as Controller Service
    participant Gateway as AI Gateway
    participant Cache as Redis/Memory Caching
    participant Agent as Resume Agent (Specialized)
    participant LLM as Gemini API Client

    Client->>Gateway: analyzeResume(resumeText)
    Gateway->>Cache: Check for duplicate md5(resumeText)
    alt Cache Hit
        Cache-->>Gateway: Return parsed analysis JSON
        Gateway-->>Client: Return analysis JSON
    else Cache Miss
        Gateway->>Agent: Route payload to ResumeAgent
        Agent->>Agent: Prepare System Prompt & User Context Memory
        Agent->>LLM: Call Gemini Pro (JSON Schema mode)
        LLM-->>Agent: Raw response string
        Agent->>Agent: Parse and validate JSON structure
        alt JSON is corrupt
            Agent->>LLM: Retry with correction system prompt (Max 3 retries)
        end
        Agent-->>Gateway: Standardized Output Object
        Gateway->>Cache: Save normalized JSON response
        Gateway-->>Client: Return analysis JSON
    end
```

---

## 3. Secure Code Execution Pipeline
The sandboxing compiler engine evaluates user programs using three tiered strategies to protect the backend node environment.

```mermaid
graph TD
    Sub[Submission Request] --> Validation[Sanitize input strings]
    Validation --> DockerCheck{Docker Engine active?}
    DockerCheck -- Yes --> ContainerExec[Spawn isolated Docker container]
    ContainerExec --> LimitCheck{Under resource limits?}
    LimitCheck -- Yes --> Complete[Return stdout / test case result]
    LimitCheck -- No --> Timeout[Return CPU / Out Of Memory error]
    DockerCheck -- No --> PistonExec[Failover: Call Piston execution API]
    PistonExec -- Success --> Complete
    PistonExec -- Failure --> VMExec[Fallback: Execute code in local vm context]
    VMExec --> Complete
```

---

## 4. Event-Driven Architecture Components
System processes are decoupled through an internal Event Bus (`AppEventBus` extending Node's `EventEmitter`).

### Domain Topics and Observers
- **Topic: `INTERVIEW_COMPLETED`**:
  - `AchievementHandler`: Computes XP adjustments, unlocks candidate badges.
  - `AnalyticsHandler`: Updates historical line points, computes placements scores.
  - `NotificationHandler`: Triggers push messages/emails informing user and mentor.
  - `RecommendationHandler`: Evaluates weaknesses, updates future career roadmaps.

- **Dead Letter Queue (DLQ) Strategy**:
  - Unhandled exceptions or failures during event handlers are trapped by the wrapper, recorded to the `ActivityLogs` DB collection with error stack metadata, and queued for retry verification.
