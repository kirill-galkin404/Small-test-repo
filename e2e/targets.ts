export type TargetName = 'legacy' | 'angular';

export interface Target {
  name: TargetName;
  port: number;
  baseURL: string;
  /** Command that serves the target. */
  command: string;
  /** Entry URL (relative to baseURL) that redirects to the counter page. */
  entryUrl: string;
  /** Counter page URL (relative to baseURL). */
  counterUrl: string;
  /** Pattern the URL must match after the entry redirect. */
  redirectPattern: RegExp;
}

export const LEGACY_PORT = 4200;
export const ANGULAR_PORT = 4300;

export const targets: Record<TargetName, Target> = {
  legacy: {
    name: 'legacy',
    port: LEGACY_PORT,
    baseURL: `http://localhost:${LEGACY_PORT}`,
    command: `npx http-server . -p ${LEGACY_PORT} -c-1 --silent`,
    entryUrl: '/index.html',
    counterUrl: '/counter.html',
    redirectPattern: /\/counter\.html$/,
  },
  angular: {
    name: 'angular',
    port: ANGULAR_PORT,
    baseURL: `http://localhost:${ANGULAR_PORT}`,
    command: `npx ng serve --port ${ANGULAR_PORT}`,
    entryUrl: '/',
    counterUrl: '/counter',
    redirectPattern: /\/counter$/,
  },
};

export function resolveTarget(value: string | undefined = process.env.TARGET): Target {
  const name = value || 'legacy';
  if (name !== 'legacy' && name !== 'angular') {
    throw new Error(`Unknown TARGET "${name}"; expected "legacy" or "angular"`);
  }
  return targets[name];
}
