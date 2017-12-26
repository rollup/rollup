import factory from 'factory';
import { foo, bar } from 'baz';
import { port, forEach } from 'shipping-port';
import alphabet, { a } from 'alphabet';

factory( null );
foo( bar, port );
forEach( console.log, console );
console.log( a );
console.log( alphabet.length );
