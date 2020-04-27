import path from 'external';
import proxyPath from './proxy';

console.log(path.normalize('foo\\bar'));
console.log(proxyPath.normalize('foo\\bar'));
