export const main = 'main';
export const synthMain = { main: true };
export * from './noOverride.js';
export * from './override.js';
export * from './hiddenNamespace.js';
export const synthOverride = 'overridden';
export { synthOverride as explicitReexport } from './override.js';
