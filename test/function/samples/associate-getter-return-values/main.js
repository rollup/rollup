const foo = { mightBeExported: {} };
const exported = {};
const fooContainer = { get foo () {return foo;} };

fooContainer.foo.mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;
