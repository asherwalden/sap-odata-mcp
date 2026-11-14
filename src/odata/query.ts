/**
 * ============================================================================
 *  ✍️  HAND-WRITE THIS FILE  — no AI-generated code here.
 *  Goal: understand OData V2 query options and URL encoding cold.
 *  Done when: `npm test -- query` is all green.
 * ============================================================================
 *
 * OData V2 "system query options" are URL params that start with `$`:
 *
 *   $filter       → WHERE clause      e.g.  SalesOrderType eq 'OR' and NetAmount gt 1000
 *   $select       → column list       e.g.  SalesOrder,SoldToParty,NetAmount
 *   $orderby      → ORDER BY          e.g.  CreationDate desc
 *   $top / $skip  → LIMIT / OFFSET
 *   $expand       → join navigation properties, e.g. to_Item
 *   $inlinecount  → 'allpages' returns the total row count alongside results
 *   $format       → we always want 'json'
 *
 * Reference: https://www.odata.org/documentation/odata-version-2-0/uri-conventions/
 *
 * Rules your implementation must follow (the tests check each one):
 *  1. Always include `$format=json`.
 *  2. Option order in the output: $filter, $select, $expand, $orderby, $top, $skip, $inlinecount, $format
 *     (a fixed order makes URLs deterministic and testable).
 *  3. Omit any option that is undefined or an empty array/string.
 *  4. Arrays (`select`, `expand`, `orderBy`) are joined with commas.
 *  5. The `$` in keys must stay a literal `$` (NOT %24).
 *  6. Values must be percent-encoded: spaces → %20, quotes → %27, etc.
 *     Hint: look at `encodeURIComponent` — then check what it does with `'`.
 *  7. Commas inside `select`/`expand`/`orderBy` stay literal commas.
 *  8. `top` must be clamped to `maxRows` (the AI will sometimes ask for 10,000 rows).
 *  9. Return the string WITHOUT a leading `?`.
 *
 * Stretch: why does rule 7 matter? What does SAP Gateway do with `%2C`?
 */

export interface ODataQueryOptions {
  filter?: string;
  select?: string[];
  expand?: string[];
  orderBy?: string[];
  top?: number;
  skip?: number;
  /** When true, sends $inlinecount=allpages so the response includes a total count. */
  count?: boolean;
}

export function buildQueryString(options: ODataQueryOptions, maxRows: number): string {
  // TODO: implement me by hand. Delete this throw when you start.
  throw new Error('buildQueryString is not implemented yet — see the comments in src/odata/query.ts');
}
