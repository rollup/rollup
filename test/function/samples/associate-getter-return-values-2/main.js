const foo = { mightBeExported: {} };
const exported = {};
const fooContainer = { get getFoo () {return () => foo;} };

fooContainer.getFoo().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;
