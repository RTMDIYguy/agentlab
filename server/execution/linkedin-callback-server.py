#!/usr/bin/env python3
"""LinkedIn OAuth callback catcher — captures code, exchanges for token, saves to .env.local."""

import http.server
import urllib.parse
import urllib.request
import json
import re
import sys
import os

CLIENT_ID = "865eewqkmfsb77"
CLIENT_SECRET = "[REDACTED]"
ENV_LOCAL = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env.local"))
PORT = 8080

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            code = params["code"][0]
            print(f"\n[CallbackServer] Authorization code received: {code[:20]}...")

            # Exchange code for token
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            data = urllib.parse.urlencode({
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": f"http://localhost:{PORT}/callback",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            }).encode()

            try:
                req = urllib.request.Request(token_url, data=data, method="POST")
                with urllib.request.urlopen(req) as resp:
                    token_data = json.loads(resp.read().decode())
                access_token = token_data.get("access_token", "")
                expires_in = token_data.get("expires_in", 0)
                print(f"[CallbackServer] Access token: {access_token[:30]}...")
                print(f"[CallbackServer] Expires in: {expires_in} seconds")

                if access_token:
                    # Update .env.local
                    with open(ENV_LOCAL, "r") as f:
                        content = f.read()

                    if "LINKEDIN_ACCESS_TOKEN=" in content:
                        content = re.sub(
                            r"LINKEDIN_ACCESS_TOKEN=.*",
                            f"LINKEDIN_ACCESS_TOKEN={access_token}",
                            content,
                        )
                    else:
                        content += f"\nLINKEDIN_ACCESS_TOKEN={access_token}\n"

                    with open(ENV_LOCAL, "w") as f:
                        f.write(content)

                    print(f"[CallbackServer] Token saved to .env.local as LINKEDIN_ACCESS_TOKEN")
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html")
                    self.end_headers()
                    self.wfile.write(b"<html><body><h1>Success! LinkedIn access token received and saved.</h1><p>You can close this tab and stop the server with Ctrl+C.</p></body></html>")
                    return
                else:
                    print(f"[CallbackServer] ERROR: No access_token in response: {token_data}")
                    self.send_response(500)
                    self.send_header("Content-Type", "text/html")
                    self.end_headers()
                    self.wfile.write(b"<html><body><h1>Error: No access token returned</h1></body></html>")
                    return
            except Exception as e:
                print(f"[CallbackServer] ERROR exchanging code: {e}")
                self.send_response(500)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                self.wfile.write(f"<html><body><h1>Error: {e}</h1></body></html>".encode())
                return
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Waiting for LinkedIn redirect...</h1><p>Authorize the app and LinkedIn will redirect here with a code.</p></body></html>")

    def log_message(self, format, *args):
        print(f"[CallbackServer] {args[0]}")

if __name__ == "__main__":
    server = http.server.HTTPServer(("", PORT), Handler)
    print(f"[CallbackServer] Listening on http://localhost:{PORT}")
    print(f"[CallbackServer] Visit: https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri=http://localhost:{PORT}/callback&scope=w_member_social")
    print(f"[CallbackServer] Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[CallbackServer] Stopped.")
        server.server_close()
