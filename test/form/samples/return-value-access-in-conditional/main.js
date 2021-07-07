function foo() {
  const result = false;
  return result;
}

console.log(foo() || true);

if (foo() || true) console.log('retained');
else console.log('removed');
