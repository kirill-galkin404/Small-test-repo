#!/usr/bin/env node
// Standalone WCAG contrast-ratio check for the dark-mode value colors
// against the dark background, parsed directly out of src/theme.css so
// this script stays correct if those tokens ever change.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const themeCssPath = join(__dirname, '..', 'src', 'theme.css')
const css = readFileSync(themeCssPath, 'utf8')

// Pull the dark-mode block out of the `[data-theme='dark']` selector
// (identical to the `@media (prefers-color-scheme: dark)` block), then
// parse the individual custom-property hex values out of it.
const darkBlockMatch = css.match(/\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\}/)
if (!darkBlockMatch) {
  throw new Error('Could not find [data-theme="dark"] block in theme.css')
}
const darkBlock = darkBlockMatch[1]

function readVar(name) {
  const match = darkBlock.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`))
  if (!match) {
    throw new Error(`Could not find --${name} in theme.css dark block`)
  }
  return match[1]
}

const bg = readVar('bg')
const pairs = [
  ['--value-positive-high', readVar('value-positive-high')],
  ['--value-negative', readVar('value-negative')],
  ['--value-neutral', readVar('value-neutral')],
]

function hexToRgb(hex) {
  let h = hex.slice(1)
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(h, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function channelToLinear(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance({ r, g, b }) {
  const R = channelToLinear(r)
  const G = channelToLinear(g)
  const B = channelToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(hexA, hexB) {
  const La = relativeLuminance(hexToRgb(hexA))
  const Lb = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(La, Lb)
  const darker = Math.min(La, Lb)
  return (lighter + 0.05) / (darker + 0.05)
}

const MIN_RATIO = 4.5
let allPass = true

console.log(`Dark background --bg: ${bg}\n`)

for (const [name, color] of pairs) {
  const ratio = contrastRatio(color, bg)
  const pass = ratio >= MIN_RATIO
  if (!pass) {
    allPass = false
  }
  console.log(
    `${name} (${color}) vs --bg (${bg}): ${ratio.toFixed(2)}:1 ${
      pass ? 'PASS' : 'FAIL'
    } (WCAG AA normal text requires >= ${MIN_RATIO}:1)`,
  )
}

if (!allPass) {
  console.error('\nOne or more dark-mode value colors fail WCAG AA contrast against --bg.')
  process.exit(1)
}

console.log('\nAll dark-mode value colors pass WCAG AA contrast against --bg.')
process.exit(0)
