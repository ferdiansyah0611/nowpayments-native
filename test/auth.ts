import { NowPayments } from "../src/index.js";
import fs from "fs";

interface AuthData {
  token: string;
  expired: number;
}

const AUTH_FILE = "test/auth.json";
const isCI = process.env.CI === 'true';

let client: NowPayments;

export function initClient() {
  client = new NowPayments({
    apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
  });
}

export async function doSignIn(): Promise<string> {
  const payload = {
    email: process.env.VITE_NOWPAYMENTS_ACC_EMAIL as string,
    password: process.env.VITE_NOWPAYMENTS_ACC_PASS as string,
  };

  const response = await client.auth.token(payload);
  
  if (!response.token) {
    throw new Error("Failed to get token from response");
  }

  // Save token to auth.json with 4 minutes expiration
  const authData: AuthData = {
    token: response.token,
    expired: Date.now() + (4 * 60 * 1000), // 4 minutes from now
  };
    
  if (!isCI) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));
  }
  
  return response.token;
}

export async function getToken(): Promise<string> {
  // Ensure client is initialized
  if (!client) {
    initClient();
  }

  // Check if github action or auth.json exists
  if (isCI || !fs.existsSync(AUTH_FILE)) {
    return await doSignIn();
  }

  // Read and parse auth data
  const authData: AuthData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));

  // Check if token is expired
  if (Date.now() > authData.expired) {
    // Token expired, do sign in again
    return await doSignIn();
  }

  return authData.token;
}

export function withAuthorization(token: string) {
  return { headers: { Authorization: `Bearer ${token}` }}
}