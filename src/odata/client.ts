import type { Config } from '../config.js';
import { buildQueryString, type ODataQueryOptions } from './query.js';
import { normalizeResponse, type NormalizedResult } from './normalize.js';

/** Error with enough detail for the AI to self-correct (e.g. a bad $filter property). */
export class ODataError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'ODataError';
  }
}

export class ODataClient {
  constructor(private readonly config: Config) {}

  private serviceUrl(service: string): string {
    return `${this.config.SAP_BASE_URL.replace(/\/$/, '')}/${encodeURIComponent(service)}`;
  }

  private async request(url: string, accept: string): Promise<Response> {
    const res = await fetch(url, {
      headers: {
        APIKey: this.config.SAP_API_KEY, // sandbox auth: one header, no OAuth (yet!)
        Accept: accept,
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new ODataError(extractSapErrorMessage(body) ?? `HTTP ${res.status}`, res.status, url);
    }
    return res;
  }

  /** Query an entity set, e.g. API_SALES_ORDER_SRV / A_SalesOrder. */
  async query(service: string, entitySet: string, options: ODataQueryOptions): Promise<NormalizedResult> {
    const qs = buildQueryString(options, this.config.SAP_MAX_ROWS);
    const url = `${this.serviceUrl(service)}/${encodeURIComponent(entitySet)}?${qs}`;
    const res = await this.request(url, 'application/json');
    return normalizeResponse(await res.json());
  }

  /** Fetch the raw EDMX $metadata document (XML) describing a service's schema. */
  async metadata(service: string): Promise<string> {
    const res = await this.request(`${this.serviceUrl(service)}/$metadata`, 'application/xml');
    return res.text();
  }
}

/** SAP Gateway errors look like {"error":{"message":{"value":"..."}}}. Pull the message out. */
function extractSapErrorMessage(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: { value?: string } }; fault?: { faultstring?: string } };
    return parsed.error?.message?.value ?? parsed.fault?.faultstring;
  } catch {
    const match = body.match(/<message[^>]*>([^<]+)<\/message>/);
    return match?.[1];
  }
}
