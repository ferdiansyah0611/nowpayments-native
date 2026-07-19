import { HttpClient } from "../http";

/** Base class for resource groups — holds a reference to the HTTP client. */
export abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}