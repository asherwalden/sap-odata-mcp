/**
 * Turns a (huge) EDMX $metadata document into a compact summary the AI can actually use.
 *
 * This first version uses regexes, which is fine for SAP Gateway's predictable output
 * but fragile in general. Roadmap milestone 3: replace with a real XML parser
 * (e.g. fast-xml-parser) and add property labels from sap:label annotations.
 */

export interface PropertySummary {
  name: string;
  type: string;
  label?: string;
}

export interface EntitySetSummary {
  entitySet: string;
  entityType: string;
  keys: string[];
  properties: PropertySummary[];
  navigationProperties: string[];
}

const attr = (tag: string, name: string): string | undefined =>
  tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

export function summarizeMetadata(xml: string, onlyEntitySet?: string): EntitySetSummary[] {
  // EntitySet Name="A_SalesOrder" EntityType="API_SALES_ORDER_SRV.A_SalesOrderType"
  const sets = [...xml.matchAll(/<EntitySet\b[^>]*>/g)].map((m) => ({
    entitySet: attr(m[0], 'Name') ?? '',
    entityType: (attr(m[0], 'EntityType') ?? '').split('.').pop() ?? '',
  }));

  const wanted = onlyEntitySet
    ? sets.filter((s) => s.entitySet.toLowerCase() === onlyEntitySet.toLowerCase())
    : sets;

  return wanted.map(({ entitySet, entityType }) => {
    const block =
      xml.match(new RegExp(`<EntityType\\b[^>]*Name="${entityType}"[^>]*>([\\s\\S]*?)</EntityType>`))?.[1] ?? '';

    const keys = [...(block.match(/<Key>([\s\S]*?)<\/Key>/)?.[1] ?? '').matchAll(/<PropertyRef\b[^>]*>/g)]
      .map((m) => attr(m[0], 'Name'))
      .filter((n): n is string => !!n);

    const properties = [...block.matchAll(/<Property\b[^>]*>/g)].map((m) => ({
      name: attr(m[0], 'Name') ?? '',
      type: (attr(m[0], 'Type') ?? '').replace('Edm.', ''),
      label: attr(m[0], 'sap:label'),
    }));

    const navigationProperties = [...block.matchAll(/<NavigationProperty\b[^>]*>/g)]
      .map((m) => attr(m[0], 'Name'))
      .filter((n): n is string => !!n);

    return { entitySet, entityType, keys, properties, navigationProperties };
  });
}
