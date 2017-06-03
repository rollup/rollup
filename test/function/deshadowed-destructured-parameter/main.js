import { x } from './x.js';

let y;

function foo ({ x = 42 }) {
	y = x;
}

foo({});
assert.equal( y, 42 );
