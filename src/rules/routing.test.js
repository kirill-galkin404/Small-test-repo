import { describe, it, expect } from 'vitest'
import { getEntryRedirectTarget, COUNTER_ROUTE } from './routing.js'

describe('entry redirect rule', () => {
  it('resolves the root entry point to the counter view', () => {
    expect(getEntryRedirectTarget()).toBe(COUNTER_ROUTE)
    expect(getEntryRedirectTarget()).toBe('counter')
  })
})
