import { useState } from "react";

// c is the counter value; cc tallies every click (reset included) for the title.
export default function Counter() {
  const [c, setC] = useState(0);
  const [cc, setCc] = useState(0);

  const update = (change) => {
    setC(change);
    setCc((n) => n + 1);
  };

  const color = c > 10 ? "red" : c < 0 ? "blue" : "black";
  const title = cc === 0 ? "Counter" : `Counter (${cc} clicks)`;

  return (
    <div id="counter">
      <h1 id="ttl">{title}</h1>
      <p id="d" style={{ color }}>{c}</p>
      <button data-action="INCREMENT" onClick={() => update((n) => n + 1)}>+</button>
      <button data-action="DECREMENT" onClick={() => update((n) => n - 1)}>-</button>
      <button data-action="RESET" onClick={() => update(() => 0)}>reset</button>
      <button data-action="ADD_FOUR" onClick={() => update((n) => n + 4)}>+4</button>
      <button data-action="DOUBLE" onClick={() => update((n) => n * 2)}>x2</button>
    </div>
  );
}
