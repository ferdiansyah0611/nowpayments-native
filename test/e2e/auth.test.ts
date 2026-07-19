import { describe, it, expect, beforeEach, vi } from "vitest";
import { NowPayments } from "../../src/index.js";
import fs from "fs";

describe("AuthResource E2E tests", () => {
  let client: NowPayments;
  
  beforeEach(() => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
  });

  describe("status", () => {
    it("should call GET /v1/status with correct options", async () => {
      const response = await client.auth.status();

      expect(response).toBeDefined()
      expect(response.message).toEqual('OK')
    });
  });

  describe("token", () => {
    it("should call POST /v1/auth with email/password payload", async () => {
      const payload = {
        email: process.env.VITE_NOWPAYMENTS_ACC_EMAIL as string,
        password: process.env.VITE_NOWPAYMENTS_ACC_PASS as string,
      };
      const response = await client.auth.token(payload);
      
      expect(response).toBeDefined()
      expect(response.token).toBeDefined()

      // Save token to auth.json with 4 minutes expiration
      const authData = {
        token: response.token,
        expired: Date.now() + (4 * 60 * 1000) // 4 minutes from now
      };
      fs.writeFileSync("test/auth.json", JSON.stringify(authData, null, 2));
    });
  });
});