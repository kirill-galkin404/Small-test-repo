import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (name) => readFileSync(resolve(process.cwd(), name), 'utf8')

describe('index.html', () => {
  const html = read('index.html')

  it('still redirects to counter.html via meta refresh', () => {
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=counter.html">')
  })

  it('keeps the fallback link', () => {
    expect(html).toContain('<a href="counter.html">counter.html</a>')
  })
})

describe('counter.html', () => {
  const html = read('counter.html')

  it('has a #root mount point', () => {
    expect(html).toContain('<div id="root"></div>')
  })

  it('loads /src/main.jsx as a module and no legacy script', () => {
    expect(html).toContain('<script type="module" src="/src/main.jsx"></script>')
    expect(html).not.toContain('counter.js')
  })
})
