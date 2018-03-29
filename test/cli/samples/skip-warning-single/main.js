import a from './a';
import b from './b';
import { unused, notused, neverused as willnotuse } from 'external';

function alsoUnused () {
	unused();
}

console.log(a);
console.log(b);

