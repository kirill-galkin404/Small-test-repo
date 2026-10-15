import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (name) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8')
const css = read('./theme.css')
const mainSource = read('./main.jsx')

const rootBlock = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ''
const tokens = Object.fromEntries(
  [...rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
)

function luminance(hex) {
  expect(hex, 'colour must be a 6-digit hex value').toMatch(/^#[0-9a-f]{6}$/i)
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function rule(selector) {
  const escaped = selector.replace(/[.\-]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  return match?.[1] ?? null
}

describe('dark theme', () => {
  it('declares color-scheme: dark on :root', () => {
    expect(rootBlock).toMatch(/color-scheme\s*:\s*dark\s*;/)
  })

  it('has a dark background', () => {
    expect(luminance(tokens['--color-bg'])).toBeLessThan(0.1)
  })

  it.each(['--color-text', '--color-high', '--color-negative', '--color-default'])(
    '%s reaches WCAG contrast 4.5 against the background',
    (token) => {
      expect(contrast(tokens[token], tokens['--color-bg'])).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['increment', 'decrement', 'reset', 'add-four', 'double'])(
    'btn--%s has background and color declarations',
    (name) => {
      const body = rule(`.btn--${name}`)
      expect(body).not.toBeNull()
      expect(body).toMatch(/(^|[\s;])background(-color)?\s*:/)
      expect(body).toMatch(/(^|[\s;])color\s*:/)
    },
  )

  it.each(['increment', 'decrement', 'reset', 'add-four', 'double'])(
    'btn--%s label text is readable on its background',
    (name) => {
      const bg = tokens[`--color-btn-${name}`]
      expect(contrast(tokens['--color-btn-text'], bg)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('is imported by main.jsx', () => {
    expect(mainSource).toMatch(/import\s+['"]\.\/theme\.css['"]/)
  })
})
