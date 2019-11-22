import unused from 'external';
import * as dep from './dep.js';
import alsoUnused from './dep.js';
import 'unresolvedExternal';

export const missing = dep.missing;
export default 42;

export * from './dep.js';
export * from './dep2.js';
