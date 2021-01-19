export * from 'starexternal1';
export { e } from 'external1';
export { d as dep } from './generated-dep.js';
import 'starexternal2';
import 'external2';

var main = '1';

export { main };
