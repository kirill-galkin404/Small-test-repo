import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, 'styles.css'), 'utf8')

const blockFor = (theme) => {
  const match = css.match(
    new RegExp(`:root\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`),
  )
  expect(match, `${theme} theme block exists in styles.css`).not.toBeNull()
  return match[1]
}

const token = (block, name, theme) => {
  const match = block.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`))
  expect(match, `${name} is defined as a 6-digit hex in the ${theme} theme`).not.toBeNull()
  return match[1]
}

const channel = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const VALUE_TOKENS = ['--value-neutral', '--value-high', '--value-low']
const BUTTON_BGS = [
  '--btn-increment-bg',
  '--btn-decrement-bg',
  '--btn-reset-bg',
  '--btn-add-four-bg',
  '--btn-double-bg',
]

describe.each(['light', 'dark'])('%s theme WCAG AA contrast', (theme) => {
  const block = blockFor(theme)
  const bg = token(block, '--bg', theme)

  it.each(VALUE_TOKENS)('%s reaches 4.5:1 against --bg', (name) => {
    const color = token(block, name, theme)
    expect(contrast(color, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('page text reaches 4.5:1 against --bg', () => {
    expect(contrast(token(block, '--text', theme), bg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(BUTTON_BGS)('button label on %s reaches 4.5:1', (name) => {
    const fg = token(block, '--btn-fg', theme)
    expect(contrast(fg, token(block, name, theme))).toBeGreaterThanOrEqual(4.5)
  })

  it('theme toggle label reaches 4.5:1 against its background', () => {
    const fg = token(block, '--toggle-fg', theme)
    expect(contrast(fg, token(block, '--toggle-bg', theme))).toBeGreaterThanOrEqual(4.5)
  })
})
