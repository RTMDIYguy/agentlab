// CC-2026-09-25-013: opaque browser key for anonymous visitor memory.
// Lives in localStorage; the founder-intake agent sends it with every turn
// so pre-email visitors are persisted, resumable, and claimable at signup.
// It is not an identifier of a person — just a browser.
export function getVisitorKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem("agentlab_visitor_key");
  if (!key) {
    key = `v_${crypto.randomUUID()}`;
    localStorage.setItem("agentlab_visitor_key", key);
  }
  return key;
}
