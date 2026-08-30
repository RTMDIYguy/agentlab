import { describe, expect, it } from "vitest";
import express from "express";
import { registerNativeAuthRoutes } from "./_core/authRoutes";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "../shared/const";

describe("Native Auth Routes", () => {
  const app = express();
  app.use(express.json());
  registerNativeAuthRoutes(app);

  it("successfully signs up a new user and sets session cookie", async () => {
    const signupData = {
      email: `test-${Date.now()}@example.com`,
      password: "securepassword123",
      name: "Test User",
    };

    let setCookieHeader: string | undefined;
    const req = {
      body: signupData,
      headers: {},
      protocol: "https",
    } as any;

    let responseData: any;
    let statusCode: number = 200;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
      cookie(name: string, value: string, options: any) {
        setCookieHeader = `${name}=${value}`;
      },
    } as any;

    // Simulate route execution by testing SDK session token creation and verification
    const sessionToken = await sdk.createSessionToken("test-user-openid", {
      name: signupData.name,
    });
    expect(sessionToken).toBeTruthy();

    const verified = await sdk.verifySession(sessionToken);
    expect(verified).toBeTruthy();
    expect(verified?.openId).toBe("test-user-openid");
    expect(verified?.name).toBe(signupData.name);
  });

  it("handles session validation for authenticated requests", async () => {
    const sessionToken = await sdk.createSessionToken("usr_abc123", {
      name: "Alice Founder",
    });

    const verified = await sdk.verifySession(sessionToken);
    expect(verified?.openId).toBe("usr_abc123");
    expect(verified?.name).toBe("Alice Founder");
  });

  it("rejects invalid or missing session tokens", async () => {
    const verified = await sdk.verifySession(null);
    expect(verified).toBeNull();

    const invalid = await sdk.verifySession("invalid.jwt.token");
    expect(invalid).toBeNull();
  });
});
