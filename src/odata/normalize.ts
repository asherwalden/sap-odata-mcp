/**
 * ============================================================================
 *  ✍️  HAND-WRITE THIS FILE  — no AI-generated code here.
 *  Goal: understand the OData V2 JSON response shape, and practice writing
 *  small pure functions with TypeScript types and recursion.
 *  Done when: `npm test -- normalize` is all green.
 * ============================================================================
 *
 * SAP Gateway OData V2 JSON is verbose. A collection looks like:
 *
 *   {
 *     "d": {
 *       "__count": "6494",                       // only when $inlinecount=allpages (note: a STRING)
 *       "results": [
 *         {
 *           "__metadata": { "uri": "...", "type": "API_BUSINESS_PARTNER.A_BusinessPartnerType" },
 *           "BusinessPartner": "11",
 *           "CreationDate": "/Date(1492041600000)/", // V2 date format — epoch millis!
 *           "to_BusinessPartnerAddress": { "__deferred": { "uri": "..." } }  // not expanded
 *         }
 *       ]
 *     }
 *   }
 *
 * A single entity (e.g. A_SalesOrder('123')) is `{ "d": { ...fields } }` with no `results`.
 * An EXPANDED navigation property contains its own `{ "results": [...] }` wrapper.
 *
 * The AI doesn't need any of the noise. Your job — normalizeResponse() must:
 *  1. Unwrap `d` and `d.results` → always return `rows` as an array (single entity → array of 1).
 *  2. Remove every `__metadata` key.
 *  3. Remove navigation properties that are still `{ __deferred: ... }` (not expanded).
 *  4. Convert `/Date(1492041600000)/` strings to ISO strings: "2017-04-13T00:00:00.000Z".
 *     Some dates have an offset like `/Date(1492041600000+0000)/` — handle that too.
 *  5. Expanded navigation properties: unwrap their `results` to a plain array, and
 *     apply rules 2–4 to them recursively.
 *  6. If `__count` exists, return it as a NUMBER in `totalCount`; otherwise omit it.
 *
 * Stretch: SAP returns Edm.Decimal as strings ("1250.00"). Should you convert them to
 * numbers? Think about floating point and currency before you decide. Write it in the README.
 */

export interface NormalizedResult {
  rows: Record<string, unknown>[];
  totalCount?: number;
}

export function normalizeResponse(raw: unknown): NormalizedResult {
  // TODO: implement me by hand. Delete this throw when you start.
  throw new Error('normalizeResponse is not implemented yet — see the comments in src/odata/normalize.ts');
}
