import external from 'external';
import other from './other.js';

const { value } = other;

console.log(external, value);

var commonjs = 42;

export default commonjs;
