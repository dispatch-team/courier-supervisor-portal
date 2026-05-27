import { describe, it, expect, beforeEach } from 'vitest'
import {
  extractUserInfo,
  isTokenExpired,
  persistTokens,
  getStoredTokens,
  clearStoredTokens,
} from '@/lib/auth'

// Build a minimal JWT with a known payload for testing
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

const CLIENT_ID = 'test-client' // matches NEXT_PUBLIC_KEYCLOAK_CLIENT_ID in setup.ts

// ─── extractUserInfo ──────────────────────────────────────────────────────────

describe('extractUserInfo', () => {
  it('parses standard claims from a valid JWT payload', () => {
    const token = makeJwt({
      sub: 'user-123',
      email: 'test@example.com',
      name: 'Abebe Bekele',
      preferred_username: 'abebe',
      given_name: 'Abebe',
      family_name: 'Bekele',
      resource_access: {
        [CLIENT_ID]: { roles: ['supervisor'] },
      },
    })
    const info = extractUserInfo(token)
    expect(info.sub).toBe('user-123')
    expect(info.email).toBe('test@example.com')
    expect(info.name).toBe('Abebe Bekele')
    expect(info.preferred_username).toBe('abebe')
    expect(info.given_name).toBe('Abebe')
    expect(info.family_name).toBe('Bekele')
  })

  it('extracts roles from the correct client in resource_access', () => {
    const token = makeJwt({
      sub: 'u1',
      resource_access: {
        [CLIENT_ID]: { roles: ['supervisor', 'courier'] },
        'other-client': { roles: ['admin'] },
      },
    })
    const info = extractUserInfo(token)
    expect(info.roles).toEqual(['supervisor', 'courier'])
    expect(info.roles).not.toContain('admin')
  })

  it('returns empty roles array when resource_access is missing', () => {
    const token = makeJwt({ sub: 'u1' })
    const info = extractUserInfo(token)
    expect(info.roles).toEqual([])
  })

  it('returns empty roles when client is not in resource_access', () => {
    const token = makeJwt({
      sub: 'u1',
      resource_access: { 'other-client': { roles: ['admin'] } },
    })
    const info = extractUserInfo(token)
    expect(info.roles).toEqual([])
  })
})

// ─── isTokenExpired ───────────────────────────────────────────────────────────

describe('isTokenExpired', () => {
  it('returns true for a token whose exp is in the past', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    const token = makeJwt({ sub: 'u1', exp: pastExp })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for a token whose exp is well in the future', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const token = makeJwt({ sub: 'u1', exp: futureExp })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true when the token expires within the 30-second buffer', () => {
    // exp is 20 seconds from now — inside the 30s safety margin
    const soonExp = Math.floor(Date.now() / 1000) + 20
    const token = makeJwt({ sub: 'u1', exp: soonExp })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false when the token expires just outside the 30-second buffer', () => {
    // exp is 60 seconds from now — outside the 30s safety margin
    const safeExp = Math.floor(Date.now() / 1000) + 60
    const token = makeJwt({ sub: 'u1', exp: safeExp })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a malformed token that cannot be parsed', () => {
    expect(isTokenExpired('not.a.jwt')).toBe(true)
    expect(isTokenExpired('garbage')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })
})

// ─── token persistence ────────────────────────────────────────────────────────

const mockTokens = {
  access_token: 'acc-token-xyz',
  refresh_token: 'ref-token-xyz',
  expires_in: 300,
  refresh_expires_in: 1800,
  token_type: 'Bearer',
  session_state: 'sess-001',
}

describe('persistTokens', () => {
  it('writes access and refresh tokens to localStorage', () => {
    persistTokens(mockTokens)
    expect(localStorage.getItem('dispatch_access_token')).toBe('acc-token-xyz')
    expect(localStorage.getItem('dispatch_refresh_token')).toBe('ref-token-xyz')
  })
})

describe('getStoredTokens', () => {
  it('returns tokens that were previously persisted', () => {
    persistTokens(mockTokens)
    const { accessToken, refreshToken } = getStoredTokens()
    expect(accessToken).toBe('acc-token-xyz')
    expect(refreshToken).toBe('ref-token-xyz')
  })

  it('returns nulls when nothing has been stored', () => {
    localStorage.clear()
    const { accessToken, refreshToken } = getStoredTokens()
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })
})

describe('clearStoredTokens', () => {
  beforeEach(() => {
    persistTokens(mockTokens)
  })

  it('removes both tokens from localStorage', () => {
    clearStoredTokens()
    expect(localStorage.getItem('dispatch_access_token')).toBeNull()
    expect(localStorage.getItem('dispatch_refresh_token')).toBeNull()
  })

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      clearStoredTokens()
      clearStoredTokens()
    }).not.toThrow()
  })
})
