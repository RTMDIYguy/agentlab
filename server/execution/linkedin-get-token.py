#!/usr/bin/env python3
"""
LinkedIn OAuth token capture — single-shot.
Run this, it prints the authorization URL, you authorize, paste back the code,
it exchanges for a token and saves to .env.local.
"""

import urllib.parse
import urllib.request
import json
import re
import os
import sys

CLIENT_ID = "865eewqkmfsb77"
# Secret is loaded from .env.local (gitignored) or the LINKEDIN_CLIENT_SECRET env var;
# never hardcode it here - see the vault doctrine in AGENTS.md.
CLIENT_SECRET = os.environ.get("LINKEDIN_CLIENT_SECRET") or ""

# .env.local is in the project root, not in server/execution/
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_LOCAL = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".env.local"))

if not CLIENT_SECRET and os.path.exists(ENV_LOCAL):
    with open(ENV_LOCAL) as _f:
        for _line in _f:
            if _line.strip().startswith("LINKEDIN_CLIENT_SECRET="):
                CLIENT_SECRET = _line.split("=", 1)[1].strip()
                break
if not CLIENT_SECRET:
    print("WARNING: LINKEDIN_CLIENT_SECRET not set - token exchange will fail.")
    print("Set it in .env.local or the environment (never hardcoded in this file).")

AUTH_URL = (
    "https://www.linkedin.com/oauth/v2/authorization"
    "?response_type=code"
    f"&client_id={CLIENT_ID}"
    f"&redirect_uri=http://localhost:8080/callback"
    "&scope=w_member_social"
)

print("=" * 60)
print("LinkedIn OAuth Token Capture")
print("=" * 60)
print()
print(f"Authorization URL:")
print(AUTH_URL)
print()
print("INSTRUCTIONS:")
print("1. Open the URL above in Chrome")
print("2. Sign in and click 'Allow' to authorize")
print("3. LinkedIn will redirect to localhost:8080/callback?code=XXX")
print("4. COPY the full URL from the address bar")
print("5. Paste it here and press Enter")
print()

code = input("Paste the callback URL here: ").strip()

# Extract code from URL
parsed = urllib.parse.urlparse(code)
params = urllib.parse.parse_qs(parsed.query)
if "code" not in params:
    print("ERROR: No 'code' parameter found in the URL")
    print("Make sure you pasted the full redirect URL")
    sys.exit(1)

auth_code = params["code"][0]
print(f"\nAuthorization code received: {auth_code[:30]}...")

# Exchange code for token
token_url = "https://www.linkedin.com/oauth/v2/accessToken"
data = urllib.parse.urlencode({
    "grant_type": "authorization_code",
    "code": auth_code,
    "redirect_uri": "http://localhost:8080/callback",
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
}).encode()

print("\nExchanging code for access token...")
try:
    req = urllib.request.Request(token_url, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        token_data = json.loads(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"ERROR: HTTP {e.code}")
    print(e.read().decode())
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

access_token = token_data.get("access_token", "")
expires_in = token_data.get("expires_in", 0)
scope = token_data.get("scope", "")

if not access_token:
    print(f"ERROR: No access token in response: {token_data}")
    sys.exit(1)

print(f"\nAccess token: {access_token[:30]}...")
print(f"Expires in: {expires_in} seconds (~{expires_in/86400:.1f} days)")
print(f"Scope: {scope}")

# Save to .env.local
print(f"\nSaving to {ENV_LOCAL}...")
try:
    with open(ENV_LOCAL, "r") as f:
        content = f.read()
except FileNotFoundError:
    content = ""

if "LINKEDIN_ACCESS_TOKEN=" in content:
    content = re.sub(
        r"LINKEDIN_ACCESS_TOKEN=.*",
        f"LINKEDIN_ACCESS_TOKEN={access_token}",
        content,
    )
    print("Updated existing LINKEDIN_ACCESS_TOKEN line")
else:
    content += f"\nLINKEDIN_ACCESS_TOKEN={access_token}\n"
    print("Added new LINKEDIN_ACCESS_TOKEN line")

with open(ENV_LOCAL, "w") as f:
    f.write(content)

print("\n✓ Token saved to .env.local as LINKEDIN_ACCESS_TOKEN")
print()
print("You can now restart the server and the dispatcher will use it.")
