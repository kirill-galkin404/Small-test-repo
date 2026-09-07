import Counter from './components/Counter.jsx'

// The root route redirects to the counter view immediately (see
// src/rules/routing.js and RULES.md). Counter is the sole view, so
// rendering App is equivalent to that redirect having already happened.
export default function App() {
  return <Counter />
}
