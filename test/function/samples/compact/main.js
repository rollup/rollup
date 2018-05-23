import x from 'external';
import * as self from './main.js';
console.log(self && self['de' + 'fault']);
export default function foo () {
	console.log( x );
}

import('./main.js').then(self => {
	console.log(self && self['de' + 'fault']);
});
