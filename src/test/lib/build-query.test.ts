import { describe, it, expect } from 'vitest'
import { buildQuery } from '@/hooks/queries/use-shipments'

describe('buildQuery', () => {
  it('returns "shipments" with no filters', () => {
    expect(buildQuery({})).toBe('shipments')
  })

  it('appends page and page_size', () => {
    expect(buildQuery({ page: 2, page_size: 10 })).toBe('shipments?page=2&page_size=10')
  })

  it('appends status filter', () => {
    expect(buildQuery({ status: 'pending' })).toBe('shipments?status=pending')
  })

  it('appends assigned_driver_id', () => {
    expect(buildQuery({ assigned_driver_id: 5 })).toBe('shipments?assigned_driver_id=5')
  })

  it('appends date range filters', () => {
    const q = buildQuery({ created_at_start: '2024-01-01', created_at_end: '2024-01-07' })
    expect(q).toBe('shipments?created_at_start=2024-01-01&created_at_end=2024-01-07')
  })

  it('combines all filters into a single query string', () => {
    const q = buildQuery({
      page: 1,
      page_size: 20,
      status: 'in_transit',
      assigned_driver_id: 3,
      created_at_start: '2024-01-01',
      created_at_end: '2024-01-31',
    })
    expect(q).toContain('page=1')
    expect(q).toContain('page_size=20')
    expect(q).toContain('status=in_transit')
    expect(q).toContain('assigned_driver_id=3')
    expect(q).toContain('created_at_start=2024-01-01')
    expect(q).toContain('created_at_end=2024-01-31')
    expect(q.startsWith('shipments?')).toBe(true)
  })

  it('omits fields that are not provided', () => {
    const q = buildQuery({ page: 1 })
    expect(q).not.toContain('page_size')
    expect(q).not.toContain('status')
    expect(q).not.toContain('assigned_driver_id')
    expect(q).not.toContain('created_at')
  })
})
