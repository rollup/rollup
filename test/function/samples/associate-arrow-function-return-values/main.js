const foo = { mightBeExported: {} };
const exported = {};

const getFoo = () => foo;

getFoo().mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;
