export * from 'starexternal1';
export { e } from 'external1';
import 'starexternal2';
import 'external2';
export { d as dep } from './generated-dep.js';

var main = '1';

export { main };
