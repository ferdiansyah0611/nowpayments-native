import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  CreatePlanPayload,
  CreateSubscriptionPayload,
  ListPlansParams,
  ListSubscriptionsParams,
  SubscriptionListResponse,
  SubscriptionPlanListResponse,
  SubscriptionPlanResponse,
  SubscriptionResponse,
  UpdatePlanPayload,
} from "../types/index.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

/**
 * Email subscriptions (recurring payments) endpoints.
 *
 * - `POST v1/subscriptions` — create a subscription (JWT).
 * - `GET v1/subscriptions` — list subscriptions (JWT).
 * - `PUT v1/subscriptions/:id` — update a subscription (JWT).
 * - `POST v1/subscriptions/:id/cancel` — cancel a subscription (JWT).
 *
 * Subscription plans (recurring payment plans) endpoints.
 *
 * - `POST v1/subscriptions/plans` — create a plan (JWT).
 * - `GET v1/subscriptions/plans/:id` — get a plan (API key).
 * - `GET v1/subscriptions/plans` — list plans (API key).
 * - `PATCH v1/subscriptions/plans/:id` — update a plan (JWT).
 *
 * Subscription payments (recurring payments) endpoints.
 *
 * - `POST v1/subscriptions` — create a subscription payment (API key & JWT).
 * - `GET v1/subscriptions` — list subscription payments (API key).
 * - `GET v1/subscriptions/:id` — get a subscription payment (API key).
 * - `DELETE v1/subscriptions/:id` — cancel a subscription payment (JWT).
 */
export class SubscriptionResource extends Resource {
  /**
   * Creates a new subscription plan.
   * Authenticated with a JWT bearer token.
   */
  createPlan(
    payload: CreatePlanPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanResponse> {
    return this.http.post<SubscriptionPlanResponse>(
      "v1/subscriptions/plans",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Gets a single subscription plan by its id.
   * Requires API key authentication.
   */
  getPlan(id: string, options?: RequestOptions): Promise<SubscriptionPlanResponse> {
    return this.http.get<SubscriptionPlanResponse>(
      `v1/subscriptions/plans/${id}`,
      undefined,
      options,
    );
  }

  /**
   * Lists all subscription plans.
   * Requires API key authentication.
   */
  getAllPlans(
    params?: ListPlansParams,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanListResponse> {
    return this.http.get<SubscriptionPlanListResponse>(
      "v1/subscriptions/plans",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Updates an existing subscription plan.
   * Authenticated with a JWT bearer token.
   */
  updatePlan(
    id: string,
    payload: UpdatePlanPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanResponse> {
    return this.http.patch<SubscriptionPlanResponse>(
      `v1/subscriptions/plans/${id}`,
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Creates a new subscription payment.
   * Authenticated with API key or JWT.
   */
  createPayment(
    payload: CreateSubscriptionPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(
      "v1/subscriptions",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Lists subscription payments with optional filters.
   * Requires API key authentication.
   */
  listPayments(
    params?: ListSubscriptionsParams,
    options?: RequestOptions,
  ): Promise<SubscriptionListResponse> {
    return this.http.get<SubscriptionListResponse>(
      "v1/subscriptions",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Gets a single subscription payment by its id.
   * Requires API key authentication.
   */
  getPayment(id: string, options?: RequestOptions): Promise<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(
      `v1/subscriptions/${id}`,
      undefined,
      options,
    );
  }

  /**
   * Cancels a subscription payment by its id.
   * Authenticated with a JWT bearer token.
   */
  cancelPayment(id: string, options?: RequestOptions): Promise<SubscriptionResponse> {
    return this.http.delete<SubscriptionResponse>(
      `v1/subscriptions/${id}`,
      undefined,
      options,
    );
  }
}