import { describe, it, expect } from 'vitest'
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateName,
  validateLicensePlate,
  validateUrl,
} from '@/lib/validation'

describe('validatePhone', () => {
  it('accepts a valid Ethiopian 09XXXXXXXX number', () => {
    expect(validatePhone('0912345678')).toBeNull()
  })

  it('accepts a valid +2519XXXXXXXX international number', () => {
    expect(validatePhone('+251912345678')).toBeNull()
  })

  it('accepts a number with surrounding whitespace by stripping spaces', () => {
    expect(validatePhone('  0912345678  ')).toBeNull()
  })

  it('returns null for empty input when not required', () => {
    expect(validatePhone('', false)).toBeNull()
  })

  it('returns an error for empty input when required', () => {
    expect(validatePhone('', true)).toBe('Phone number is required')
  })

  it('returns an error for required empty by default', () => {
    expect(validatePhone('')).toBe('Phone number is required')
  })

  it('rejects a number missing the leading 0', () => {
    expect(validatePhone('912345678')).toBe('Use format 09XXXXXXXX or +2519XXXXXXXX')
  })

  it('rejects a number with too few digits', () => {
    expect(validatePhone('091234567')).toBe('Use format 09XXXXXXXX or +2519XXXXXXXX')
  })

  it('rejects a number with too many digits', () => {
    expect(validatePhone('09123456789')).toBe('Use format 09XXXXXXXX or +2519XXXXXXXX')
  })

  it('rejects a +251 number starting with 8 instead of 9', () => {
    expect(validatePhone('+251812345678')).toBe('Use format 09XXXXXXXX or +2519XXXXXXXX')
  })

  it('rejects an arbitrary non-Ethiopian number', () => {
    expect(validatePhone('+14155552671')).toBe('Use format 09XXXXXXXX or +2519XXXXXXXX')
  })
})

describe('validateEmail', () => {
  it('accepts a valid email address', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.org')).toBeNull()
  })

  it('returns null for empty input when not required', () => {
    expect(validateEmail('', false)).toBeNull()
  })

  it('returns an error for empty input when required', () => {
    expect(validateEmail('', true)).toBe('Email is required')
  })

  it('returns an error for empty input when required by default', () => {
    expect(validateEmail('')).toBe('Email is required')
  })

  it('rejects an address missing the @ symbol', () => {
    expect(validateEmail('notanemail')).toBe('Invalid email format')
  })

  it('rejects an address missing the domain', () => {
    expect(validateEmail('user@')).toBe('Invalid email format')
  })

  it('rejects an address with spaces', () => {
    expect(validateEmail('user @example.com')).toBe('Invalid email format')
  })

  it('rejects an email exceeding 255 characters', () => {
    const longLocal = 'a'.repeat(250)
    expect(validateEmail(`${longLocal}@x.com`)).toBe('Email must be under 255 characters')
  })
})

describe('validatePassword', () => {
  it('accepts a valid password with all requirements met', () => {
    expect(validatePassword('Password1!')).toBeNull()
  })

  it('returns an error for an empty password', () => {
    expect(validatePassword('')).toBe('Password is required')
  })

  it('rejects a password shorter than 8 characters', () => {
    expect(validatePassword('Ab1!')).toBe('Must be at least 8 characters')
  })

  it('rejects a password missing an uppercase letter', () => {
    expect(validatePassword('password1!')).toBe('Must include an uppercase letter')
  })

  it('rejects a password missing a lowercase letter', () => {
    expect(validatePassword('PASSWORD1!')).toBe('Must include a lowercase letter')
  })

  it('rejects a password missing a digit', () => {
    expect(validatePassword('Password!')).toBe('Must include a number')
  })

  it('rejects a password missing a special character', () => {
    expect(validatePassword('Password1')).toBe('Must include a special character')
  })
})

describe('validateName', () => {
  it('accepts a valid name', () => {
    expect(validateName('Abebe', 'First name')).toBeNull()
  })

  it('returns an error for empty input when required', () => {
    expect(validateName('', 'First name')).toBe('First name is required')
  })

  it('returns null for empty input when not required', () => {
    expect(validateName('', 'First name', false)).toBeNull()
  })

  it('rejects a name longer than 50 characters', () => {
    const longName = 'A'.repeat(51)
    expect(validateName(longName, 'Last name')).toBe('Last name must be under 50 characters')
  })

  it('accepts a name exactly at the 50 character limit', () => {
    const maxName = 'A'.repeat(50)
    expect(validateName(maxName, 'Last name')).toBeNull()
  })

  it('trims whitespace before checking emptiness', () => {
    expect(validateName('   ', 'First name')).toBe('First name is required')
  })
})

describe('validateLicensePlate', () => {
  it('accepts a valid 2-letter plate with hyphen', () => {
    expect(validateLicensePlate('AA-12345')).toBeNull()
  })

  it('accepts a valid 3-letter plate with hyphen', () => {
    expect(validateLicensePlate('TGR-00001')).toBeNull()
  })

  it('accepts a valid plate with space separator', () => {
    expect(validateLicensePlate('AA 12345')).toBeNull()
  })

  it('uppercases input before validating so lowercase is also accepted', () => {
    expect(validateLicensePlate('aa-12345')).toBeNull()
  })

  it('returns an error for empty input', () => {
    expect(validateLicensePlate('')).toBe('License plate is required')
  })

  it('rejects a plate with only digits', () => {
    expect(validateLicensePlate('12345')).toBe(
      'Use format AA-12345 (2–3 letters, hyphen, 5 digits)',
    )
  })

  it('rejects a plate missing the separator', () => {
    expect(validateLicensePlate('AA12345')).toBe(
      'Use format AA-12345 (2–3 letters, hyphen, 5 digits)',
    )
  })

  it('rejects a plate with too many digits', () => {
    expect(validateLicensePlate('AA-123456')).toBe(
      'Use format AA-12345 (2–3 letters, hyphen, 5 digits)',
    )
  })

  it('rejects a plate with too many letters', () => {
    expect(validateLicensePlate('AAAA-12345')).toBe(
      'Use format AA-12345 (2–3 letters, hyphen, 5 digits)',
    )
  })
})

describe('validateUrl', () => {
  it('accepts a valid https URL', () => {
    expect(validateUrl('https://example.com')).toBeNull()
  })

  it('accepts a valid http URL', () => {
    expect(validateUrl('http://example.com')).toBeNull()
  })

  it('returns null for empty input when not required (default)', () => {
    expect(validateUrl('')).toBeNull()
  })

  it('returns an error for empty input when required', () => {
    expect(validateUrl('', true)).toBe('Website URL is required')
  })

  it('rejects a URL with an unsupported protocol', () => {
    expect(validateUrl('ftp://example.com')).toBe('URL must start with http:// or https://')
  })

  it('rejects a completely invalid URL string', () => {
    expect(validateUrl('not-a-url')).toBe('Invalid URL (e.g. https://example.com)')
  })
})
