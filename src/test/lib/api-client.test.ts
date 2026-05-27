import { describe, it, expect, beforeEach } from 'vitest'
import { friendlyError, ApiError } from '@/lib/api-client'

describe('friendlyError', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('with an ApiError instance', () => {
    it('returns the English 400 message for a 400 status', () => {
      const err = new ApiError(400, { message: 'bad request' })
      expect(friendlyError(err)).toBe(
        'The request was invalid. Please check your input and try again.',
      )
    })

    it('returns the English 401 message for a 401 status', () => {
      const err = new ApiError(401, {})
      expect(friendlyError(err)).toBe('Your session has expired. Please sign in again.')
    })

    it('returns the English 403 message for a 403 status', () => {
      const err = new ApiError(403, {})
      expect(friendlyError(err)).toBe("You don't have permission to perform this action.")
    })

    it('returns the English 404 message for a 404 status', () => {
      const err = new ApiError(404, {})
      expect(friendlyError(err)).toBe('The requested resource was not found.')
    })

    it('returns the English 500 message for a 500 status', () => {
      const err = new ApiError(500, {})
      expect(friendlyError(err)).toBe('Something went wrong on our end. Please try again.')
    })

    it('returns the unexpected error fallback for an unmapped status code', () => {
      const err = new ApiError(418, {})
      expect(friendlyError(err)).toBe('An unexpected error occurred. Please try again.')
    })

    it('returns the Amharic 401 message when locale is set to am', () => {
      localStorage.setItem('dispatch_locale', 'am')
      const err = new ApiError(401, {})
      expect(friendlyError(err)).toBe('የእርስዎ ክፍለ-ጊዜ አልቋል። እባክዎ እንደገና ይግቡ።')
    })

    it('falls back to English when locale is an unknown value', () => {
      localStorage.setItem('dispatch_locale', 'fr')
      const err = new ApiError(401, {})
      expect(friendlyError(err)).toBe('Your session has expired. Please sign in again.')
    })
  })

  describe('with a plain Error instance', () => {
    it('returns the network error message when the message contains "network"', () => {
      expect(friendlyError(new Error('network failure'))).toBe(
        'Unable to reach the server. Check your connection and try again.',
      )
    })

    it('returns the network error message when the message contains "fetch"', () => {
      expect(friendlyError(new Error('Failed to fetch'))).toBe(
        'Unable to reach the server. Check your connection and try again.',
      )
    })

    it('returns the unexpected error message for an unrecognized Error', () => {
      expect(friendlyError(new Error('something random'))).toBe(
        'An unexpected error occurred. Please try again.',
      )
    })
  })

  describe('with non-Error inputs', () => {
    it('returns the unexpected error message for a string', () => {
      expect(friendlyError('oops')).toBe('An unexpected error occurred. Please try again.')
    })

    it('returns the unexpected error message for null', () => {
      expect(friendlyError(null)).toBe('An unexpected error occurred. Please try again.')
    })

    it('returns the unexpected error message for undefined', () => {
      expect(friendlyError(undefined)).toBe('An unexpected error occurred. Please try again.')
    })

    it('returns the unexpected error message for a plain object', () => {
      expect(friendlyError({ status: 400 })).toBe('An unexpected error occurred. Please try again.')
    })
  })
})

describe('ApiError', () => {
  it('sets name to ApiError', () => {
    const err = new ApiError(400, { message: 'bad' })
    expect(err.name).toBe('ApiError')
  })

  it('uses the body.message as the error message', () => {
    const err = new ApiError(400, { message: 'validation failed' })
    expect(err.message).toBe('validation failed')
  })

  it('falls back to body.error when body.message is absent', () => {
    const err = new ApiError(400, { error: 'invalid_grant' })
    expect(err.message).toBe('invalid_grant')
  })

  it('uses the default message when body has no known message key', () => {
    const err = new ApiError(500, {})
    expect(err.message).toBe('Request failed')
  })

  it('uses the default message for a non-object body', () => {
    const err = new ApiError(500, 'string error body')
    expect(err.message).toBe('Request failed')
  })

  it('stores the status code', () => {
    const err = new ApiError(404, {})
    expect(err.status).toBe(404)
  })

  it('stores the original body', () => {
    const body = { message: 'not found', code: 'MISSING' }
    const err = new ApiError(404, body)
    expect(err.body).toEqual(body)
  })
})
