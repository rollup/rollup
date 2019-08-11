const foo = {value: false};
const exported = {};

function getFoo() {
  return foo;
}

getFoo().value = true;

if (foo.value) {
	exported.bar = 'present'
}

export default exported;
