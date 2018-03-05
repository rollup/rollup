function update () {
  foo += 10;
}

let foo = 10;

function update$1 () {
  bar++;
}

let bar = 10;

function update$2 () {
  ++baz;
}

let baz = 10;

console.log(foo);
update();
console.log(foo);
console.log(bar);
update$1();
console.log(bar);
console.log(baz);
update$2();
console.log(baz);

export { update as updateFoo, update$1 as updateBar, update$2 as updateBaz, foo, bar, baz };
