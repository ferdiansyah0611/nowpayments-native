/**
 * Zod schemas for the auth resource (`client.auth`).
 *
 * - `authPayloadSchema`   — request body for `POST /v1/auth`
 * - `apiStatusSchema`     — response from `GET /v1/status`
 * - `jwtTokenSchema`      — response from `POST /v1/auth`
 */
import { z } from "zod";

/** Payload for `POST /v1/auth` — dashboard email/password. */
export const authPayloadSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Response from `GET /v1/status` (public, no auth). */
export const apiStatusSchema = z.looseObject({
  message: z.string(),
});

/** Response from `POST /v1/auth`. Token expires in 5 minutes. */
export const jwtTokenSchema = z.looseObject({
  token: z.string().min(1),
});

export type AuthPayloadInput = z.infer<typeof authPayloadSchema>;
export type ApiStatusOutput = z.infer<typeof apiStatusSchema>;
export type JwtTokenOutput = z.infer<typeof jwtTokenSchema>;
