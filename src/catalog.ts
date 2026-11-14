/**
 * A small, curated catalog of S/4HANA Cloud OData V2 services that are available
 * in the SAP Business Accelerator Hub sandbox.
 *
 * Why curate instead of discovering? The AI needs good descriptions to pick the
 * right service. Writing these well is "prompt engineering for tools" — a real skill.
 *
 * Stretch goal: add more services, or auto-discover entity sets from $metadata.
 */
export interface ServiceInfo {
  /** Technical service name, appended to SAP_BASE_URL. */
  name: string;
  /** Human-friendly description the model reads when choosing a service. */
  description: string;
  /** The most useful entity sets, so the model doesn't have to guess. */
  keyEntitySets: string[];
}

export const SERVICE_CATALOG: ServiceInfo[] = [
  {
    name: 'API_BUSINESS_PARTNER',
    description:
      'Business partners: customers, suppliers, contacts, addresses, bank details.',
    keyEntitySets: ['A_BusinessPartner', 'A_Customer', 'A_Supplier', 'A_BusinessPartnerAddress'],
  },
  {
    name: 'API_SALES_ORDER_SRV',
    description: 'Sales orders: headers, items, pricing, partners, schedule lines.',
    keyEntitySets: ['A_SalesOrder', 'A_SalesOrderItem'],
  },
  {
    name: 'API_PURCHASEORDER_PROCESS_SRV',
    description: 'Purchase orders: headers, items, account assignments, schedule lines.',
    keyEntitySets: ['A_PurchaseOrder', 'A_PurchaseOrderItem'],
  },
  {
    name: 'API_PRODUCT_SRV',
    description: 'Product (material) master: descriptions, plant data, sales data, valuation.',
    keyEntitySets: ['A_Product', 'A_ProductDescription', 'A_ProductPlant'],
  },
];

export function findService(name: string): ServiceInfo | undefined {
  return SERVICE_CATALOG.find((s) => s.name.toLowerCase() === name.toLowerCase());
}
