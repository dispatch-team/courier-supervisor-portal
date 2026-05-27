import { describe, it, expect } from 'vitest'
import { computeDriverMetrics, formatDuration } from '@/lib/driver-metrics'
import { makeShipment } from '../fixtures'

const rangeStart = new Date('2024-01-01T00:00:00Z')
const rangeEnd = new Date('2024-01-07T23:59:59Z')

describe('computeDriverMetrics', () => {
  it('returns all zeros and nulls for an empty shipment list', () => {
    const metrics = computeDriverMetrics([], rangeStart, rangeEnd)
    expect(metrics.total).toBe(0)
    expect(metrics.delivered).toBe(0)
    expect(metrics.failed).toBe(0)
    expect(metrics.cancelled).toBe(0)
    expect(metrics.returned).toBe(0)
    expect(metrics.inProgress).toBe(0)
    expect(metrics.successRate).toBe(0)
    expect(metrics.failureRate).toBe(0)
    expect(metrics.avgPickupToDeliveryMs).toBeNull()
    expect(metrics.avgRating).toBeNull()
  })

  it('counts delivered shipments within the range correctly', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T10:00:00Z' }),
      makeShipment({ id: 2, status: 'delivered', delivered_at: '2024-01-05T14:00:00Z' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.delivered).toBe(2)
    expect(metrics.total).toBe(2)
  })

  it('counts failed shipments', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'failed', failed_at: '2024-01-02T10:00:00Z', remark: 'No access' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.failed).toBe(1)
    expect(metrics.failureReasons).toHaveLength(1)
    expect(metrics.failureReasons[0].reason).toBe('No access')
    expect(metrics.failureReasons[0].count).toBe(1)
  })

  it('uses "Unspecified" as the failure reason when remark is empty', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'failed', failed_at: '2024-01-02T10:00:00Z', remark: '' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.failureReasons[0].reason).toBe('Unspecified')
  })

  it('calculates success and failure rates from completed attempts', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T10:00:00Z' }),
      makeShipment({ id: 2, status: 'delivered', delivered_at: '2024-01-03T11:00:00Z' }),
      makeShipment({ id: 3, status: 'failed', failed_at: '2024-01-03T12:00:00Z', remark: '' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    // 2 delivered, 1 failed → successRate = 2/3, failureRate = 1/3
    expect(metrics.successRate).toBeCloseTo(2 / 3)
    expect(metrics.failureRate).toBeCloseTo(1 / 3)
  })

  it('counts in-progress shipments (assigned_to_driver, picked_up, in_transit)', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'assigned_to_driver' }),
      makeShipment({ id: 2, status: 'picked_up' }),
      makeShipment({ id: 3, status: 'in_transit' }),
      makeShipment({ id: 4, status: 'cancelled', cancelled_at: '2024-01-02T09:00:00Z' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.inProgress).toBe(3)
    expect(metrics.cancelled).toBe(1)
  })

  it('calculates average pickup-to-delivery time for delivered shipments', () => {
    // 1 hour = 3600000ms
    const shipments = [
      makeShipment({
        id: 1,
        status: 'delivered',
        picked_up_at: '2024-01-03T09:00:00Z',
        delivered_at: '2024-01-03T11:00:00Z', // 2h = 7200000ms
      }),
      makeShipment({
        id: 2,
        status: 'delivered',
        picked_up_at: '2024-01-03T09:00:00Z',
        delivered_at: '2024-01-03T10:00:00Z', // 1h = 3600000ms
      }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    // avg = (7200000 + 3600000) / 2 = 5400000
    expect(metrics.avgPickupToDeliveryMs).toBe(5400000)
  })

  it('returns null for avgPickupToDeliveryMs when no delivered shipments have timestamps', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', picked_up_at: null, delivered_at: null }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.avgPickupToDeliveryMs).toBeNull()
  })

  it('calculates deliveries per day based on the range', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T10:00:00Z' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    // 7 days in range, 1 delivered → 1/7
    expect(metrics.deliveriesPerDay).toBeCloseTo(1 / 7)
  })

  it('computes avgRating as sum of ratings divided by count divided by 2', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T10:00:00Z', rating: 8 }),
      makeShipment({ id: 2, status: 'delivered', delivered_at: '2024-01-03T11:00:00Z', rating: 6 }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    // (8 + 6) / 2 / 2 = 3.5
    expect(metrics.avgRating).toBe(3.5)
  })

  it('returns null for avgRating when no deliveries have ratings > 0', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T10:00:00Z', rating: 0 }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    expect(metrics.avgRating).toBeNull()
  })

  it('zero-fills the daily volume across the entire date range', () => {
    const metrics = computeDriverMetrics([], rangeStart, rangeEnd)
    // Jan 1-7 = 7 days
    expect(metrics.dailyVolume).toHaveLength(7)
    expect(metrics.dailyVolume.every((d) => d.delivered === 0 && d.failed === 0)).toBe(true)
  })

  it('buckets delivered and failed shipments into the correct date slots', () => {
    const shipments = [
      makeShipment({ id: 1, status: 'delivered', delivered_at: '2024-01-03T15:00:00Z' }),
      makeShipment({ id: 2, status: 'failed', failed_at: '2024-01-03T16:00:00Z', remark: '' }),
    ]
    const metrics = computeDriverMetrics(shipments, rangeStart, rangeEnd)
    const jan3 = metrics.dailyVolume.find((d) => d.date === '2024-01-03')
    expect(jan3).toBeDefined()
    expect(jan3!.delivered).toBe(1)
    expect(jan3!.failed).toBe(1)
  })
})

describe('formatDuration', () => {
  it('returns the em-dash for null input', () => {
    expect(formatDuration(null)).toBe('—')
  })

  it('returns "0m" for zero milliseconds', () => {
    expect(formatDuration(0)).toBe('0m')
  })

  it('returns minutes only when under 1 hour', () => {
    expect(formatDuration(25 * 60 * 1000)).toBe('25m')
  })

  it('returns hours and minutes for values >= 1 hour', () => {
    expect(formatDuration(90 * 60 * 1000)).toBe('1h 30m')
  })

  it('formats exactly 2 hours as "2h 0m"', () => {
    expect(formatDuration(2 * 60 * 60 * 1000)).toBe('2h 0m')
  })
})
