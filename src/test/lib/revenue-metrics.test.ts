import { describe, it, expect } from 'vitest'
import { computeRevenueMetrics, formatEtb, isShipmentInRange } from '@/lib/revenue-metrics'
import { makeDriver, makeShipment } from '../fixtures'

const rangeStart = new Date('2024-01-01T00:00:00Z')
const rangeEnd = new Date('2024-01-07T23:59:59Z')

describe('isShipmentInRange', () => {
  it('returns true when delivered_at is within the range', () => {
    const s = makeShipment({ delivered_at: '2024-01-04T12:00:00Z' })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(true)
  })

  it('returns true when delivered_at is exactly on the start boundary', () => {
    const s = makeShipment({ delivered_at: '2024-01-01T00:00:00Z' })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(true)
  })

  it('returns true when delivered_at is exactly on the end boundary', () => {
    const s = makeShipment({ delivered_at: '2024-01-07T23:59:59Z' })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(true)
  })

  it('returns false when delivered_at is before the range start', () => {
    const s = makeShipment({ delivered_at: '2023-12-31T23:59:59Z' })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(false)
  })

  it('returns false when delivered_at is after the range end', () => {
    const s = makeShipment({ delivered_at: '2024-01-08T00:00:01Z' })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(false)
  })

  it('returns false when delivered_at is null', () => {
    const s = makeShipment({ delivered_at: null })
    expect(isShipmentInRange(s, rangeStart, rangeEnd)).toBe(false)
  })
})

describe('formatEtb', () => {
  it('formats zero as "ETB 0"', () => {
    expect(formatEtb(0)).toBe('ETB 0')
  })

  it('formats a whole number without decimals', () => {
    expect(formatEtb(1500)).toBe('ETB 1,500')
  })

  it('formats a decimal amount', () => {
    expect(formatEtb(99.5)).toBe('ETB 99.5')
  })

  it('formats a large number with thousands separator', () => {
    expect(formatEtb(1000000)).toBe('ETB 1,000,000')
  })

  it('limits to 2 decimal places', () => {
    expect(formatEtb(10.126)).toMatch(/^ETB 10\.13/)
  })
})

describe('computeRevenueMetrics', () => {
  it('returns all zeros for empty inputs', () => {
    const metrics = computeRevenueMetrics([], [], [], rangeStart, rangeEnd)
    expect(metrics.totalRevenue).toBe(0)
    expect(metrics.deliveredCount).toBe(0)
    expect(metrics.avgPerDelivery).toBe(0)
    expect(metrics.prior.totalRevenue).toBe(0)
    expect(metrics.prior.deliveredCount).toBe(0)
    expect(metrics.revenueChangePct).toBe(0)
    expect(metrics.topDrivers).toHaveLength(0)
  })

  it('sums total_fee for current delivered shipments', () => {
    const drivers = [makeDriver({ id: 1 })]
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 200, assigned_driver_id: 1 }),
      makeShipment({ id: 2, status: 'delivered', total_fee: 300, assigned_driver_id: 1 }),
    ]
    const metrics = computeRevenueMetrics(drivers, current, [], rangeStart, rangeEnd)
    expect(metrics.totalRevenue).toBe(500)
    expect(metrics.deliveredCount).toBe(2)
    expect(metrics.avgPerDelivery).toBe(250)
  })

  it('excludes non-delivered current shipments from revenue', () => {
    const drivers = [makeDriver({ id: 1 })]
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 200, assigned_driver_id: 1 }),
      makeShipment({ id: 2, status: 'failed', total_fee: 150, assigned_driver_id: 1 }),
    ]
    const metrics = computeRevenueMetrics(drivers, current, [], rangeStart, rangeEnd)
    expect(metrics.totalRevenue).toBe(200)
    expect(metrics.deliveredCount).toBe(1)
  })

  it('calculates revenueChangePct compared to prior period', () => {
    const drivers = [makeDriver({ id: 1 })]
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 200, assigned_driver_id: 1 }),
    ]
    const prior = [
      makeShipment({ id: 2, status: 'delivered', total_fee: 100, assigned_driver_id: 1 }),
    ]
    const metrics = computeRevenueMetrics(drivers, current, prior, rangeStart, rangeEnd)
    // (200 - 100) / 100 = 1.0 = +100%
    expect(metrics.revenueChangePct).toBe(1.0)
  })

  it('returns revenueChangePct of 1 when prior revenue is zero and current is positive', () => {
    const drivers = [makeDriver({ id: 1 })]
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 500, assigned_driver_id: 1 }),
    ]
    const metrics = computeRevenueMetrics(drivers, current, [], rangeStart, rangeEnd)
    expect(metrics.revenueChangePct).toBe(1)
  })

  it('zero-fills the daily revenue series across the full range', () => {
    const metrics = computeRevenueMetrics([], [], [], rangeStart, rangeEnd)
    // Jan 1-7 = 7 days
    expect(metrics.dailyRevenue).toHaveLength(7)
    expect(metrics.dailyRevenue.every((d) => d.revenue === 0 && d.count === 0)).toBe(true)
  })

  it('attributes daily revenue to the correct date slot', () => {
    const drivers = [makeDriver({ id: 1 })]
    const current = [
      makeShipment({
        id: 1,
        status: 'delivered',
        total_fee: 250,
        assigned_driver_id: 1,
        delivered_at: '2024-01-04T12:00:00Z',
      }),
    ]
    const metrics = computeRevenueMetrics(drivers, current, [], rangeStart, rangeEnd)
    const jan4 = metrics.dailyRevenue.find((d) => d.date === '2024-01-04')
    expect(jan4).toBeDefined()
    expect(jan4!.revenue).toBe(250)
    expect(jan4!.count).toBe(1)
  })

  it('ranks top drivers by revenue descending', () => {
    const d1 = makeDriver({ id: 1 })
    const d2 = makeDriver({ id: 2 })
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 100, assigned_driver_id: 1 }),
      makeShipment({ id: 2, status: 'delivered', total_fee: 400, assigned_driver_id: 2 }),
      makeShipment({ id: 3, status: 'delivered', total_fee: 50, assigned_driver_id: 1 }),
    ]
    const metrics = computeRevenueMetrics([d1, d2], current, [], rangeStart, rangeEnd)
    expect(metrics.topDrivers[0].driver.id).toBe(2)
    expect(metrics.topDrivers[0].revenue).toBe(400)
    expect(metrics.topDrivers[1].driver.id).toBe(1)
    expect(metrics.topDrivers[1].revenue).toBe(150)
  })

  it('excludes shipments without an assigned driver from topDrivers', () => {
    const d1 = makeDriver({ id: 1 })
    const current = [
      makeShipment({ id: 1, status: 'delivered', total_fee: 200, assigned_driver_id: null }),
    ]
    const metrics = computeRevenueMetrics([d1], current, [], rangeStart, rangeEnd)
    expect(metrics.topDrivers).toHaveLength(0)
  })
})
