import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { SERVICE_CATALOG, findService } from '../catalog.js';
import { ODataClient, ODataError } from '../odata/client.js';
import { summarizeMetadata } from '../odata/metadata.js';

/** Shape every tool result the same way: JSON text for the model + structured content. */
function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

/** Errors are returned (not thrown) with isError, so the model can read them and retry. */
function fail(err: unknown) {
  const message =
    err instanceof ODataError
      ? `SAP returned ${err.status}: ${err.message}\nURL: ${err.url}`
      : err instanceof Error
        ? err.message
        : String(err);
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

export function registerTools(server: McpServer, client: ODataClient) {
  // ── 1. Discovery ─────────────────────────────────────────────────────────
  server.registerTool(
    'sap_list_services',
    {
      title: 'List SAP OData services',
      description:
        'List the SAP S/4HANA OData services this server can query, with descriptions and key entity sets. Call this first.',
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => ok(SERVICE_CATALOG),
  );

  // ── 2. Schema ────────────────────────────────────────────────────────────
  server.registerTool(
    'sap_describe_entity_set',
    {
      title: 'Describe an SAP entity set',
      description:
        'Return the fields (name, type, label), keys and navigation properties of an entity set, from the service $metadata. ' +
        'Call this before building a $filter or $select so you use real field names.',
      inputSchema: z.object({
        service: z.string().describe('Service name, e.g. API_SALES_ORDER_SRV'),
        entitySet: z.string().describe('Entity set name, e.g. A_SalesOrder'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ service, entitySet }) => {
      try {
        if (!findService(service)) throw new Error(`Unknown service "${service}". Call sap_list_services.`);
        const summary = summarizeMetadata(await client.metadata(service), entitySet);
        if (summary.length === 0) throw new Error(`Entity set "${entitySet}" not found in ${service}.`);
        return ok(summary[0]);
      } catch (err) {
        return fail(err);
      }
    },
  );

  // ── 3. Query ─────────────────────────────────────────────────────────────
  server.registerTool(
    'sap_query',
    {
      title: 'Query SAP data',
      description:
        'Read records from an SAP OData V2 entity set using OData query options. ' +
        "Filter syntax examples: \"SalesOrderType eq 'OR'\", \"TotalNetAmount gt 1000\", " +
        "\"substringof('Inc', BusinessPartnerName)\". Dates: \"CreationDate ge datetime'2024-01-01T00:00:00'\".",
      inputSchema: z.object({
        service: z.string().describe('Service name from sap_list_services'),
        entitySet: z.string().describe('Entity set, e.g. A_SalesOrder'),
        filter: z.string().optional().describe('OData V2 $filter expression'),
        select: z.array(z.string()).optional().describe('Fields to return (keep it small!)'),
        expand: z.array(z.string()).optional().describe('Navigation properties to include, e.g. to_Item'),
        orderBy: z.array(z.string()).optional().describe('e.g. ["CreationDate desc"]'),
        top: z.number().int().positive().optional().describe('Max rows (server caps this)'),
        skip: z.number().int().nonnegative().optional(),
        count: z.boolean().optional().describe('Include total matching row count'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ service, entitySet, ...options }) => {
      try {
        if (!findService(service)) throw new Error(`Unknown service "${service}". Call sap_list_services.`);
        return ok(await client.query(service, entitySet, options));
      } catch (err) {
        return fail(err);
      }
    },
  );
}
