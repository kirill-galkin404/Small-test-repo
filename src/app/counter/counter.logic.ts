export enum Action {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  RESET = 'RESET',
  ADD_FOUR = 'ADD_FOUR',
  DOUBLE = 'DOUBLE',
}

export interface CounterState {
  value: number;
  clicks: number;
}

export const initialState: CounterState = { value: 0, clicks: 0 };

export function parseAction(name: string | undefined): Action | undefined {
  if (!name || !Object.prototype.hasOwnProperty.call(Action, name)) {
    return undefined;
  }
  return Action[name as keyof typeof Action];
}

export function dispatch(state: CounterState, action: Action | undefined): CounterState {
  let value: number;
  switch (action) {
    case Action.INCREMENT:
      value = state.value + 1;
      break;
    case Action.DECREMENT:
      value = state.value - 1;
      break;
    case Action.RESET:
      value = 0;
      break;
    case Action.ADD_FOUR:
      value = state.value + 4;
      break;
    case Action.DOUBLE:
      value = state.value * 2;
      break;
    default:
      console.warn('dispatch: unrecognized action', action);
      return state;
  }
  return { value, clicks: state.clicks + 1 };
}

export function colorFor(value: number): 'red' | 'blue' | 'black' {
  if (value > 10) return 'red';
  if (value < 0) return 'blue';
  return 'black';
}

export function titleFor(clicks: number): string {
  return clicks === 0 ? 'Counter' : `Counter (${clicks} clicks)`;
}
