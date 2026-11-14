import { describe, expect, it } from 'vitest';
import { normalizeResponse } from '../src/odata/normalize.js';

const meta = (type: string) => ({ __metadata: { uri: 'https://example/x', type } });

describe('normalizeResponse', () => {
  it('unwraps d.results into rows and strips __metadata', () => {
    const raw = {
      d: {
        results: [
          { ...meta('BP'), BusinessPartner: '11', BusinessPartnerName: 'Inlandkunde DE 1' },
          { ...meta('BP'), BusinessPartner: '12', BusinessPartnerName: 'Domestic US Customer' },
        ],
      },
    };
    expect(normalizeResponse(raw)).toEqual({
      rows: [
        { BusinessPartner: '11', BusinessPartnerName: 'Inlandkunde DE 1' },
        { BusinessPartner: '12', BusinessPartnerName: 'Domestic US Customer' },
      ],
    });
  });

  it('wraps a single entity (no results array) into an array of one', () => {
    const raw = { d: { ...meta('SO'), SalesOrder: '1' } };
    expect(normalizeResponse(raw)).toEqual({ rows: [{ SalesOrder: '1' }] });
  });

  it('drops unexpanded __deferred navigation properties', () => {
    const raw = {
      d: { results: [{ ...meta('SO'), SalesOrder: '1', to_Item: { __deferred: { uri: 'https://x' } } }] },
    };
    expect(normalizeResponse(raw).rows[0]).toEqual({ SalesOrder: '1' });
  });

  it('converts /Date(ms)/ and /Date(ms+0000)/ to ISO strings', () => {
    const raw = {
      d: {
        results: [
          { CreationDate: '/Date(1492041600000)/', LastChangeDateTime: '/Date(1492041600000+0000)/' },
        ],
      },
    };
    expect(normalizeResponse(raw).rows[0]).toEqual({
      CreationDate: '2017-04-13T00:00:00.000Z',
      LastChangeDateTime: '2017-04-13T00:00:00.000Z',
    });
  });

  it('leaves ordinary strings that merely contain "Date" alone', () => {
    const raw = { d: { results: [{ Note: 'Date TBD' }] } };
    expect(normalizeResponse(raw).rows[0]).toEqual({ Note: 'Date TBD' });
  });

  it('recursively normalizes expanded navigation properties', () => {
    const raw = {
      d: {
        results: [
          {
            ...meta('SO'),
            SalesOrder: '1',
            to_Item: {
              results: [
                {
                  ...meta('SOItem'),
                  SalesOrderItem: '10',
                  RequestedDeliveryDate: '/Date(1492041600000)/',
                  to_Partner: { __deferred: { uri: 'https://x' } },
                },
              ],
            },
          },
        ],
      },
    };
    expect(normalizeResponse(raw).rows[0]).toEqual({
      SalesOrder: '1',
      to_Item: [{ SalesOrderItem: '10', RequestedDeliveryDate: '2017-04-13T00:00:00.000Z' }],
    });
  });

  it('returns __count as a numeric totalCount', () => {
    const raw = { d: { __count: '6494', results: [] } };
    expect(normalizeResponse(raw)).toEqual({ rows: [], totalCount: 6494 });
  });
});
