import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (name) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8')
const themeCss = read('./theme.css')
const counterCss = read('./counter.css')

// Returns the body of the first top-level block whose selector text equals `selector`
// (an `@media` block is addressed by its full prelude and its body is returned as-is).
function blockBody(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`block not found: ${selector}`)
  let depth = 0
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', start) + 1, i)
  }
  throw new Error(`unterminated block: ${selector}`)
}

function variables(body) {
  const vars = {}
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim()
  return vars
}

function luminance(hex) {
  const n = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const light = variables(blockBody(themeCss, ':root'))
const dark = variables(blockBody(themeCss, ':root[data-theme="dark"]'))
const mediaBody = blockBody(themeCss, '@media (prefers-color-scheme: dark)')
const osDark = variables(blockBody(mediaBody, ':root:not([data-theme="light"])'))
const explicitLight = variables(blockBody(themeCss, ':root[data-theme="light"]'))

const BUTTONS = ['increment', 'decrement', 'reset', 'add-four', 'double']
const TONES = ['high', 'low', 'neutral']

function pairs(palette) {
  return [
    ...BUTTONS.map((b) => [`--btn-${b}-fg on --btn-${b}-bg`, palette[`--btn-${b}-fg`], palette[`--btn-${b}-bg`]]),
    ...TONES.flatMap((t) => [
      [`--value-${t} on --bg`, palette[`--value-${t}`], palette['--bg']],
      [`--value-${t} on --card-bg`, palette[`--value-${t}`], palette['--card-bg']],
    ]),
    ['--fg on --bg', palette['--fg'], palette['--bg']],
    ['--toggle-fg on --toggle-bg', palette['--toggle-fg'], palette['--toggle-bg']],
  ]
}

describe.each([
  ['light (:root)', light],
  ['light (explicit data-theme)', explicitLight],
  ['dark (data-theme)', dark],
  ['dark (prefers-color-scheme)', osDark],
])('WCAG AA contrast: %s palette', (_name, palette) => {
  it.each(pairs(palette))('%s is at least 4.5:1', (_label, fg, bg) => {
    expect(fg).toMatch(/^#[0-9a-f]{6}$/i)
    expect(bg).toMatch(/^#[0-9a-f]{6}$/i)
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('palette consistency', () => {
  it('uses identical values in the two dark blocks', () => {
    expect(Object.keys(osDark).length).toBeGreaterThan(0)
    expect(osDark).toEqual(dark)
  })

  it('restores the :root light values with an explicit light theme', () => {
    expect(explicitLight).toEqual(light)
  })

  it('counter.css uses the tested button and value variables', () => {
    const actions = { INCREMENT: 'increment', DECREMENT: 'decrement', RESET: 'reset', ADD_FOUR: 'add-four', DOUBLE: 'double' }
    for (const [action, name] of Object.entries(actions)) {
      const body = blockBody(counterCss, `button[data-action="${action}"]`)
      expect(body).toContain(`background: var(--btn-${name}-bg)`)
      expect(body).toContain(`color: var(--btn-${name}-fg)`)
    }
    for (const tone of TONES) {
      expect(blockBody(counterCss, `.value--${tone}`)).toContain(`color: var(--value-${tone})`)
    }
  })
})
