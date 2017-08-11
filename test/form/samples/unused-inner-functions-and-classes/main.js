import { foo, bar, bog, boo, baz } from './stuff';

bar();
var f = baz();
f();

function getClass () {
    class MyClass {}
    class UnusedInnerClass1 {}
    return MyClass;
    class UnusedInnerClass2 {}
}

class UnusedClass {}

console.log( getClass().name );

