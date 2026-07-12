/**
 * Conversion (currency conversion) types for the NowPayments API.
 */

import type { CryptoCurrency, Money } from "./main.types.js";

export namespace Conversion {
  /** Status of a currency conversion. */
  export type Status =
    | "WAITING"
    | "PROCESSING"
    | "FINISHED"
    | "REJECTED";

  /** A single conversion record. */
  export interface Conversion {
    /** Conversion ID. */
    id: string;
    /** Current status of the conversion. */
    status: Status;
    /** Currency being converted from. */
    from_currency: CryptoCurrency;
    /** Currency being converted to. */
    to_currency: CryptoCurrency;
    /** Amount being converted from. */
    from_amount: Money;
    /** Amount received after conversion. */
    to_amount: Money | null;
    /** ISO 8601 creation timestamp. */
    created_at: string;
    /** ISO 8601 last-update timestamp. */
    updated_at: string;
  }

  /** Payload to create a new conversion. */
  export interface CreatePayload {
    /** The amount of the conversion. */
    amount: Money;
    /** The currency you're converting your funds from. */
    from_currency: CryptoCurrency;
    /** The currency you're converting your funds to. */
    to_currency: CryptoCurrency;
  }

  /** Response wrapper for conversion operations. */
  export interface Response {
    result: Conversion;
  }

  /** Parameters for listing conversions. */
  export interface ListParams {
    /** Filter by ID of the conversion (int or array of int). */
    id?: number | number[];
    /** Filter conversions by certain status (string or array of string). */
    status?: Status | Status[];
    /** Filter by initial currency of the conversion. */
    from_currency?: CryptoCurrency;
    /** Filter by outcome currency of the conversion. */
    to_currency?: CryptoCurrency;
    /** Filter by date (ISO 8601 format). */
    created_at_from?: string;
    /** Filter by date (ISO 8601 format). */
    created_at_to?: string;
    /** Set the limit of shown results. @default 10 */
    limit?: number;
    /** Page number (0-indexed). @default 0 */
    offset?: number;
    /** Set the sorting order of provided data. */
    order?: "ASC" | "DESC";
  }

  /** Response for listing conversions. */
  export interface ListResponse {
    result: Conversion[];
    /** Total number of conversions matching the query. */
    count: number;
  }
}