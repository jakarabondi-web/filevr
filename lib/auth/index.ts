/**
 * Auth adapter seam. Swap for Auth.js/Clerk in production.
 * See .env.example for required provider credentials (TODO: choose vendor).
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: "free" | "pro" | "team" | "business";
  usagePercent: number;
}

/** Mock session for local development. Returns null to simulate a guest. */
export async function getSessionUser(): Promise<SessionUser | null> {
  return {
    id: "user_mock_1",
    name: "Alex Jordan",
    email: "alex@example.com",
    initials: "AJ",
    plan: "free",
    usagePercent: 78,
  };
}
