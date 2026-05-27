import { describe, it, expect } from 'vitest'
import { computeFleetMetrics } from '@/lib/fleet-metrics'
import { makeDriver, makeShipment } from '../fixtures'

describe('computeFleetMetrics', () => {
  it('returns all zeros when there are no drivers', () => {
    const metrics = computeFleetMetrics([], [])
    expect(metrics.totalActiveDrivers).toBe(0)
    expect(metrics.onDelivery).toBe(0)
    expect(metrics.idle).toBe(0)
    expect(metrics.totalShipments).toBe(0)
    expect(metrics.utilizationRate).toBe(0)
    expect(metrics.avgWorkload).toBe(0)
    expect(metrics.capacityRisk).toBe('low')
  })

  it('only counts drivers with status "active"', () => {
    const drivers = [
      makeDriver({ id: 1, status: 'active' }),
      makeDriver({ id: 2, status: 'inactive' }),
      makeDriver({ id: 3, status: 'pending' }),
    ]
    const metrics = computeFleetMetrics(drivers, [])
    expect(metrics.totalActiveDrivers).toBe(1)
  })

  it('counts drivers with at least one in-progress shipment as "onDelivery"', () => {
    const drivers = [
      makeDriver({ id: 1, status: 'active' }),
      makeDriver({ id: 2, status: 'active' }),
    ]
    const shipments = [
      makeShipment({ id: 1, assigned_driver_id: 1, status: 'in_transit' }),
      makeShipment({ id: 2, assigned_driver_id: 2, status: 'delivered' }),
    ]
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.onDelivery).toBe(1)
    expect(metrics.idle).toBe(1)
  })

  it('counts totalDelivered from all delivered shipments', () => {
    const drivers = [makeDriver({ id: 1, status: 'active' })]
    const shipments = [
      makeShipment({ id: 1, assigned_driver_id: 1, status: 'delivered' }),
      makeShipment({ id: 2, assigned_driver_id: 1, status: 'delivered' }),
      makeShipment({ id: 3, assigned_driver_id: 1, status: 'failed' }),
    ]
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.totalDelivered).toBe(2)
    expect(metrics.totalShipments).toBe(3)
  })

  it('ignores shipments assigned to inactive drivers in the workload map', () => {
    const drivers = [
      makeDriver({ id: 1, status: 'active' }),
      makeDriver({ id: 2, status: 'inactive' }),
    ]
    const shipments = [
      makeShipment({ id: 1, assigned_driver_id: 2, status: 'in_transit' }),
    ]
    const metrics = computeFleetMetrics(drivers, shipments)
    // The inactive driver's shipment is not counted toward active workload
    expect(metrics.onDelivery).toBe(0)
    expect(metrics.workload[0].inProgress).toBe(0)
  })

  it('calculates utilizationRate as onDelivery / totalActiveDrivers', () => {
    const drivers = [
      makeDriver({ id: 1, status: 'active' }),
      makeDriver({ id: 2, status: 'active' }),
      makeDriver({ id: 3, status: 'active' }),
      makeDriver({ id: 4, status: 'active' }),
    ]
    const shipments = [
      makeShipment({ id: 1, assigned_driver_id: 1, status: 'in_transit' }),
      makeShipment({ id: 2, assigned_driver_id: 2, status: 'picked_up' }),
    ]
    const metrics = computeFleetMetrics(drivers, shipments)
    // 2 on delivery out of 4 active = 0.5
    expect(metrics.utilizationRate).toBe(0.5)
  })

  it('sets capacityRisk to "high" when utilizationRate >= 0.85', () => {
    const drivers = Array.from({ length: 10 }, (_, i) =>
      makeDriver({ id: i + 1, status: 'active' }),
    )
    const shipments = Array.from({ length: 9 }, (_, i) =>
      makeShipment({ id: i + 1, assigned_driver_id: i + 1, status: 'in_transit' }),
    )
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.capacityRisk).toBe('high')
  })

  it('sets capacityRisk to "moderate" when utilizationRate is between 0.6 and 0.85', () => {
    const drivers = Array.from({ length: 10 }, (_, i) =>
      makeDriver({ id: i + 1, status: 'active' }),
    )
    const shipments = Array.from({ length: 7 }, (_, i) =>
      makeShipment({ id: i + 1, assigned_driver_id: i + 1, status: 'in_transit' }),
    )
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.capacityRisk).toBe('moderate')
  })

  it('sets capacityRisk to "low" when utilizationRate < 0.6', () => {
    const drivers = Array.from({ length: 10 }, (_, i) =>
      makeDriver({ id: i + 1, status: 'active' }),
    )
    const shipments = Array.from({ length: 4 }, (_, i) =>
      makeShipment({ id: i + 1, assigned_driver_id: i + 1, status: 'in_transit' }),
    )
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.capacityRisk).toBe('low')
  })

  it('zero-fills all 24 hours in the hourlyActivity array', () => {
    const metrics = computeFleetMetrics([], [])
    expect(metrics.hourlyActivity).toHaveLength(24)
    expect(metrics.hourlyActivity.every((h) => h.count === 0)).toBe(true)
  })

  it('builds a workload entry for each active driver', () => {
    const drivers = [
      makeDriver({ id: 1, status: 'active' }),
      makeDriver({ id: 2, status: 'active' }),
    ]
    const metrics = computeFleetMetrics(drivers, [])
    expect(metrics.workload).toHaveLength(2)
  })

  it('identifies peakHours when activity is concentrated in specific hours', () => {
    const drivers = [makeDriver({ id: 1, status: 'active' })]
    // Flood a single hour with 5 shipments (well above avg across 24 hours)
    const shipments = Array.from({ length: 5 }, (_, i) =>
      makeShipment({
        id: i + 1,
        assigned_driver_id: 1,
        status: 'delivered',
        picked_up_at: `2024-01-15T10:0${i}:00Z`,
      }),
    )
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.peakHours.length).toBeGreaterThan(0)
    // All 5 shipments land in the same local hour — verify the peak count
    expect(metrics.peakHours[0].count).toBe(5)
    expect(metrics.peakHours[0].hour).toBeGreaterThanOrEqual(0)
    expect(metrics.peakHours[0].hour).toBeLessThan(24)
  })

  it('returns empty peakHours when activity is too sparse or uniform', () => {
    const drivers = [makeDriver({ id: 1, status: 'active' })]
    // Only 1 shipment — count of 1 does not meet the >= 2 threshold
    const shipments = [
      makeShipment({ id: 1, assigned_driver_id: 1, status: 'delivered', picked_up_at: '2024-01-15T09:00:00Z' }),
    ]
    const metrics = computeFleetMetrics(drivers, shipments)
    expect(metrics.peakHours).toHaveLength(0)
  })
})
