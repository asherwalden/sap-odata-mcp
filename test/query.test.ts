import { describe, expect, it } from 'vitest';
import { buildQueryString } from '../src/odata/query.js';

const MAX = 50;

describe('buildQueryString', () => {
  it('always includes $format=json', () => {
    expect(buildQueryString({}, MAX)).toBe('$format=json');
  });

  it('keeps $ literal and does not add a leading ?', () => {
    const qs = buildQueryString({ top: 5 }, MAX);
    expect(qs.startsWith('?')).toBe(false);
    expect(qs).not.toContain('%24');
    expect(qs).toBe('$top=5&$format=json');
  });

  it('joins arrays with literal commas', () => {
    expect(buildQueryString({ select: ['SalesOrder', 'SoldToParty', 'TotalNetAmount'] }, MAX)).toBe(
      '$select=SalesOrder,SoldToParty,TotalNetAmount&$format=json',
    );
  });

  it('percent-encodes spaces and single quotes in $filter', () => {
    expect(buildQueryString({ filter: "SalesOrderType eq 'OR'" }, MAX)).toBe(
      '$filter=SalesOrderType%20eq%20%27OR%27&$format=json',
    );
  });

  it('encodes spaces inside orderBy items but keeps the commas', () => {
    expect(buildQueryString({ orderBy: ['CreationDate desc', 'SalesOrder asc'] }, MAX)).toBe(
      '$orderby=CreationDate%20desc,SalesOrder%20asc&$format=json',
    );
  });

  it('clamps $top to maxRows', () => {
    expect(buildQueryString({ top: 10_000 }, MAX)).toBe('$top=50&$format=json');
  });

  it('omits undefined and empty options', () => {
    expect(buildQueryString({ filter: '', select: [], expand: undefined, skip: undefined }, MAX)).toBe(
      '$format=json',
    );
  });

  it('keeps $skip=0 out but $skip=20 in', () => {
    expect(buildQueryString({ skip: 0 }, MAX)).toBe('$format=json');
    expect(buildQueryString({ skip: 20 }, MAX)).toBe('$skip=20&$format=json');
  });

  it('emits options in the documented order', () => {
    const qs = buildQueryString(
      {
        count: true,
        skip: 10,
        top: 5,
        orderBy: ['CreationDate desc'],
        expand: ['to_Item'],
        select: ['SalesOrder'],
        filter: 'TotalNetAmount gt 1000',
      },
      MAX,
    );
    expect(qs).toBe(
      '$filter=TotalNetAmount%20gt%201000' +
        '&$select=SalesOrder' +
        '&$expand=to_Item' +
        '&$orderby=CreationDate%20desc' +
        '&$top=5' +
        '&$skip=10' +
        '&$inlinecount=allpages' +
        '&$format=json',
    );
  });
});
