import Bar from './bar';

export default function Foo () {}

Foo.prototype = Object.create( Bar.prototype );
