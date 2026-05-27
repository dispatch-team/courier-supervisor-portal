import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useBatchAssignDriver, type BatchResult } from '@/hooks/queries/use-batch-assign'
import { ApiError } from '@/lib/api-client'

vi.mock('@/hooks/use-api', () => ({
  useApi: vi.fn(),
}))

import { useApi } from '@/hooks/use-api'
const mockUseApi = vi.mocked(useApi)

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useBatchAssignDriver mutationFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all-success results when every post succeeds', async () => {
    const mockPost = vi.fn().mockResolvedValue({})
    mockUseApi.mockReturnValue({ post: mockPost } as ReturnType<typeof useApi>)

    const { result } = renderHook(() => useBatchAssignDriver(), { wrapper })

    let results!: BatchResult[]
    await act(async () => {
      results = await result.current.mutateAsync({ shipmentCodes: ['SHP-001', 'SHP-002'], driverId: 5 })
    })

    expect(results).toEqual([
      { code: 'SHP-001', success: true },
      { code: 'SHP-002', success: true },
    ])
  })

  it('calls post with correct path and payload for each shipment', async () => {
    const mockPost = vi.fn().mockResolvedValue({})
    mockUseApi.mockReturnValue({ post: mockPost } as ReturnType<typeof useApi>)

    const { result } = renderHook(() => useBatchAssignDriver(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ shipmentCodes: ['SHP-A', 'SHP-B'], driverId: 7 })
    })

    expect(mockPost).toHaveBeenCalledTimes(2)
    expect(mockPost).toHaveBeenNthCalledWith(1, 'shipments/SHP-A/assign-driver', { driver_id: 7 })
    expect(mockPost).toHaveBeenNthCalledWith(2, 'shipments/SHP-B/assign-driver', { driver_id: 7 })
  })

  it('continues processing remaining shipments when one fails', async () => {
    const mockPost = vi.fn()
      .mockResolvedValueOnce({})                                          // SHP-001 ok
      .mockRejectedValueOnce(new ApiError(400, { message: 'bad input' })) // SHP-002 fails
      .mockResolvedValueOnce({})                                          // SHP-003 ok

    mockUseApi.mockReturnValue({ post: mockPost } as ReturnType<typeof useApi>)

    const { result } = renderHook(() => useBatchAssignDriver(), { wrapper })

    let results!: BatchResult[]
    await act(async () => {
      results = await result.current.mutateAsync({
        shipmentCodes: ['SHP-001', 'SHP-002', 'SHP-003'],
        driverId: 5,
      })
    })

    expect(results).toHaveLength(3)
    expect(results[0]).toEqual({ code: 'SHP-001', success: true })
    expect(results[1].success).toBe(false)
    expect(results[1].code).toBe('SHP-002')
    expect(typeof results[1].error).toBe('string')
    expect(results[2]).toEqual({ code: 'SHP-003', success: true })
  })

  it('returns all-failure results when every post throws', async () => {
    const mockPost = vi.fn().mockRejectedValue(new ApiError(500, { error: 'server error' }))
    mockUseApi.mockReturnValue({ post: mockPost } as ReturnType<typeof useApi>)

    const { result } = renderHook(() => useBatchAssignDriver(), { wrapper })

    let results!: BatchResult[]
    await act(async () => {
      results = await result.current.mutateAsync({ shipmentCodes: ['SHP-001', 'SHP-002'], driverId: 3 })
    })

    expect(results).toHaveLength(2)
    expect(results.every((r) => r.success === false)).toBe(true)
    expect(results.every((r) => typeof r.error === 'string')).toBe(true)
  })

  it('returns an empty array when no shipment codes are provided', async () => {
    const mockPost = vi.fn()
    mockUseApi.mockReturnValue({ post: mockPost } as ReturnType<typeof useApi>)

    const { result } = renderHook(() => useBatchAssignDriver(), { wrapper })

    let results!: BatchResult[]
    await act(async () => {
      results = await result.current.mutateAsync({ shipmentCodes: [], driverId: 1 })
    })

    expect(results).toEqual([])
    expect(mockPost).not.toHaveBeenCalled()
  })
})
