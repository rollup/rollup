export default function foo() {
  return 1;
}

export function callsFoo() {
  return foo();
}