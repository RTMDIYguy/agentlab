/**
 * Definitive credential probe: calls the Gemini models endpoint with the
 * stored GOOGLE_GENERATIVE_AI_API_KEY. Prints Google's response and status —
 * never the key itself.
 */
const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
if (!key) {
  console.log("no key present");
  process.exit(0);
}
console.log("probing generativelanguage.googleapis.com/v1beta/models with stored value (len=" + key.length + ", prefix=" + key.slice(0, 4) + "...)...");
try {
  const useBearer = process.argv.includes("--bearer");
  const useBoth = process.argv.includes("--both");
  const useNoAuth = process.argv.includes("--noauth");
  const headers = useNoAuth
    ? {}
    : useBoth
      ? { "x-goog-api-key": key, Authorization: `Bearer ${key}` }
      : useBearer
        ? { Authorization: `Bearer ${key}` }
        : { "x-goog-api-key": key };
  console.log("auth header style:", useBoth ? "x-goog-api-key + Authorization: Bearer (dual)" : useBearer ? "Authorization: Bearer" : "x-goog-api-key");
  const useGenerate = process.argv.includes("--generate");
  const useVertex = process.argv.includes("--vertex");
  const apiVersion = process.argv.includes("--v1alpha") ? "v1alpha" : "v1beta";
  const url = useVertex
    ? (process.argv.includes("--projected")
        ? "https://aiplatform.googleapis.com/v1/projects/project-36330a6c-5e91-4901-9dd/locations/us-central1/publishers/google/models/gemini-2.0-flash:generateContent"
        : "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.0-flash:generateContent")
    : useGenerate
      ? `https://generativelanguage.googleapis.com/${apiVersion}/models/gemini-2.0-flash-lite:generateContent`
      : `https://generativelanguage.googleapis.com/${apiVersion}/models?pageSize=1`;
  const init = { headers, method: useGenerate ? "POST" : "GET" };
  if (useGenerate) init.body = JSON.stringify({ contents: [{ parts: [{ text: "Reply with the single word: pong" }] }] });
  const targetUrl = process.argv.includes("--querykey") ? `${url}?key=${encodeURIComponent(key)}` : url;
  const res = await fetch(targetUrl, init);
  const body = await res.text();
  console.log("HTTP status:", res.status);
  try {
    const j = JSON.parse(body);
    console.log("error message:", j?.error?.message);
    for (const d of j?.error?.details ?? []) {
      if (d?.reason) console.log("reason:", d.reason);
      if (d?.metadata) console.log("metadata:", JSON.stringify(d.metadata));
    }
    console.log("status:", j?.error?.status);
  } catch {
    console.log("response head:", body.slice(0, 400));
  }
  if (res.status === 404 && !body) {
    for (const [h, v] of res.headers) {
      if (/^(server|x-|via|alt-svc|date)/i.test(h)) console.log(`hdr ${h}: ${v}`);
    }
  }
} catch (e) {
  console.log("network error:", e.message);
}
