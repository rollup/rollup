import factory from 'factory';
import { bar, foo } from 'baz';
import { port } from 'shipping-port';
import * as containers from 'shipping-port';
import alphabet, { a } from 'alphabet';

factory( null );
foo( bar, port );
containers.forEach( console.log, console );
console.log( a );
console.log( alphabet.length );
