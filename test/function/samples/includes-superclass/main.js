import { Thing } from './thing';

const thing = new Thing();

assert.ok( thing.foo() );
assert.ok( thing.bar() );
