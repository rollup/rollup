import factory from 'factory';
import { foo, bar } from 'baz';
import * as containers from 'shipping-port';
import alphabet, { a, b } from 'alphabet';

factory( null );
foo( bar );
containers.forEach( console.log, console );
console.log( a );
console.log( alphabet.length );
