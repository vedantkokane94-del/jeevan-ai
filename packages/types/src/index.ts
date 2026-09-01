/**
 * JEEVAN AI — Shared Type Definitions
 *
 * Central type definitions for API contracts shared between
 * frontend and backend. Types are added as features are built.
 */

// =========================================================================
// Severity & Status (SRS §8.1, §9.3)
// =========================================================================

/** Operational priority levels — never presented as medical diagnosis (SRS §8.1) */
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

/** Incident lifecycle states (SRS §9.3, FR-INC-2) */
export type IncidentStatus =
  | "NEW"
  | "TRIAGED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "EN_ROUTE"
  | "ON_SCENE"
  | "TRANSPORTING"
  | "RESOLVED"
  | "CANCELLED";

/** Responder availability states (SRS §9.4, FR-RSP-1) */
export type ResponderStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

/** Risk level classification (SRS §9.6) */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

/** Recommendation decision states (SRS §9.8, FR-DEC-1) */
export type DecisionAction = "APPROVED" | "MODIFIED" | "REJECTED";

// =========================================================================
// AI Output Metadata (SRS §2.5 — every AI output carries these)
// =========================================================================

/** Metadata required on every AI-generated output (SRS §2.5, FR-AI-5) */
export interface AIOutputMeta {
  model_version: string;
  confidence: number;
  timestamp: string;
  data_quality: number;
}

// =========================================================================
// API Response Contracts
// =========================================================================

/** Standard API error response */
export interface APIError {
  detail: string;
  status_code: number;
}

/** Health check response */
export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
}

// =========================================================================
// Identity & Access Management (SRS §10.2)
// =========================================================================

/** System Roles (SRS §4) */
export type UserRole = "PUBLIC" | "RESPONDER" | "COMMAND" | "ADMIN";

/** Standard User Profile */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone_number?: string;
  created_at: string;
}

/** Authentication Token Response */
export interface AuthToken {
  access_token: string;
  token_type: "bearer";
}

/** Login Credentials payload */
export interface LoginCredentials {
  email: string;
  password: string;
}

