import { describe, expect, it } from 'vitest';
import { summarizeMetadata } from '../src/odata/metadata.js';

// Trimmed-down EDMX in the shape SAP Gateway produces.
const EDMX = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">
  <edmx:DataServices>
    <Schema Namespace="API_SALES_ORDER_SRV">
      <EntityType Name="A_SalesOrderType" sap:label="Sales Order">
        <Key><PropertyRef Name="SalesOrder"/></Key>
        <Property Name="SalesOrder" Type="Edm.String" MaxLength="10" sap:label="Sales Order"/>
        <Property Name="TotalNetAmount" Type="Edm.Decimal" Precision="16" Scale="3" sap:label="Net Value"/>
        <NavigationProperty Name="to_Item" Relationship="x" FromRole="a" ToRole="b"/>
      </EntityType>
      <EntityType Name="A_SalesOrderItemType">
        <Key><PropertyRef Name="SalesOrder"/><PropertyRef Name="SalesOrderItem"/></Key>
        <Property Name="SalesOrderItem" Type="Edm.String"/>
      </EntityType>
      <EntityContainer Name="API_SALES_ORDER_SRV_Entities">
        <EntitySet Name="A_SalesOrder" EntityType="API_SALES_ORDER_SRV.A_SalesOrderType"/>
        <EntitySet Name="A_SalesOrderItem" EntityType="API_SALES_ORDER_SRV.A_SalesOrderItemType"/>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`;

describe('summarizeMetadata', () => {
  it('summarizes every entity set by default', () => {
    expect(summarizeMetadata(EDMX).map((s) => s.entitySet)).toEqual(['A_SalesOrder', 'A_SalesOrderItem']);
  });

  it('extracts keys, typed properties with labels, and navigation properties', () => {
    expect(summarizeMetadata(EDMX, 'a_salesorder')).toEqual([
      {
        entitySet: 'A_SalesOrder',
        entityType: 'A_SalesOrderType',
        keys: ['SalesOrder'],
        properties: [
          { name: 'SalesOrder', type: 'String', label: 'Sales Order' },
          { name: 'TotalNetAmount', type: 'Decimal', label: 'Net Value' },
        ],
        navigationProperties: ['to_Item'],
      },
    ]);
  });

  it('handles composite keys', () => {
    expect(summarizeMetadata(EDMX, 'A_SalesOrderItem')[0]?.keys).toEqual(['SalesOrder', 'SalesOrderItem']);
  });
});
