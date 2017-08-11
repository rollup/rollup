import factory from 'factory';
import { bar, foo } from 'baz';
import { forEach, port } from 'shipping-port';
import alphabet, { a } from 'alphabet';

factory( null );
foo( bar, port );
forEach( console.log, console );
console.log( a );
console.log( alphabet.length );
