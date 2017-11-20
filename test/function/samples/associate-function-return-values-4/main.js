const foo = {mightBeExported: {}};
const exported = {};

function getFooOrUndefined() {
  if (Math.random() < 0.5) {
    return;
  }
  return foo;
}

const returnedFoo = getFooOrUndefined() || foo;
returnedFoo.mightBeExported = exported;
foo.mightBeExported.bar = 'present';

export default exported;
