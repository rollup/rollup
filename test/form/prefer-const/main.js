import external from 'external';
import a from 'other';
import { b } from 'other';
import { another } from 'another';
import * as namespace from './namespace.js';

console.log( Object.keys( namespace ) );

export default 42;
