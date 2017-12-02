import { bar, baz } from './stuff';

bar();
var f = baz();
f();

function getClass () {
    class MyClass {}
    return MyClass;
    
}

console.log( getClass().name );
