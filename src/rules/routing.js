// Canonical entry routing rule: the site root redirects to the counter view
// immediately (no delay). See RULES.md for the business-rule definition.

export const ENTRY_ROUTE = '/'
export const COUNTER_ROUTE = 'counter'

export function getEntryRedirectTarget() {
  return COUNTER_ROUTE
}
