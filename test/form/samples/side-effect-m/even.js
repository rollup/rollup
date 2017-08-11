import { odd } from './odd.js'

export var counter = 0;

// This should be in the output
export var foo = odd( 12 );

export function even ( n ) {
	alert( counter++ )
	return n === 0 || odd( n - 1 );
}
