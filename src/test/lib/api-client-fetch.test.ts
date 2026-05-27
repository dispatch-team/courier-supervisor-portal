import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiClient, ApiError } from '@/lib/api-client'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

const getToken = () => Promise.resolve('test-token')
const noToken = () => Promise.resolve(null)

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('createApiClient', () => {
  describe('GET', () => {
    it('calls fetch with GET method and correct path', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { id: 1 }))
      const api = createApiClient(getToken)
      const result = await api.get('/drivers/1')
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/drivers/1',
        expect.objectContaining({ method: 'GET' }),
      )
      expect(result).toEqual({ id: 1 })
    })

    it('strips leading slash from path', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(getToken)
      await api.get('/shipments')
      expect(fetch).toHaveBeenCalledWith('/api/v1/shipments', expect.anything())
    })

    it('attaches Bearer token to Authorization header', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(getToken)
      await api.get('/drivers')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      )
    })

    it('omits Authorization header when token is null', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(noToken)
      await api.get('/drivers')
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    })
  })

  describe('POST', () => {
    it('calls fetch with POST method and JSON body', async () => {
      vi.stubGlobal('fetch', mockFetch(201, { id: 99 }))
      const api = createApiClient(getToken)
      const result = await api.post('/drivers', { name: 'Test' })
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/drivers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      )
      expect(result).toEqual({ id: 99 })
    })

    it('sends POST without body when no body argument is given', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(getToken)
      await api.post('/some/action')
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(init.body).toBeUndefined()
    })
  })

  describe('PATCH and PUT', () => {
    it('calls fetch with PATCH method', async () => {
      vi.stubGlobal('fetch', mockFetch(200, { updated: true }))
      const api = createApiClient(getToken)
      await api.patch('/drivers/1', { status: 'active' })
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/drivers/1',
        expect.objectContaining({ method: 'PATCH' }),
      )
    })

    it('calls fetch with PUT method', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(getToken)
      await api.put('/couriers/1', { name: 'Updated' })
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/couriers/1',
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  describe('DELETE', () => {
    it('calls fetch with DELETE method', async () => {
      vi.stubGlobal('fetch', mockFetch(200, {}))
      const api = createApiClient(getToken)
      await api.del('/drivers/1')
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/drivers/1',
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('204 No Content', () => {
    it('returns undefined for a 204 response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve({}) }))
      const api = createApiClient(getToken)
      const result = await api.del('/drivers/1')
      expect(result).toBeUndefined()
    })
  })

  describe('error responses', () => {
    it('throws ApiError with status and body on a 400 response', async () => {
      vi.stubGlobal('fetch', mockFetch(400, { message: 'bad input' }))
      const api = createApiClient(getToken)
      await expect(api.post('/shipments', {})).rejects.toBeInstanceOf(ApiError)
    })

    it('throws ApiError with correct status code on 404', async () => {
      vi.stubGlobal('fetch', mockFetch(404, { message: 'not found' }))
      const api = createApiClient(getToken)
      try {
        await api.get('/shipments/MISSING')
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError)
        expect((e as ApiError).status).toBe(404)
      }
    })

    it('throws ApiError on 500 server error', async () => {
      vi.stubGlobal('fetch', mockFetch(500, { error: 'internal error' }))
      const api = createApiClient(getToken)
      await expect(api.get('/drivers')).rejects.toBeInstanceOf(ApiError)
    })
  })
})
