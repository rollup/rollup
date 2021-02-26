function update$2 () {
  foo += 10;
}

let foo = 10;

function update$1 () {
  bar++;
}

let bar = 10;

function update () {
  ++baz;
}

let baz = 10;

console.log(foo);
update$2();
console.log(foo);
console.log(bar);
update$1();
console.log(bar);
console.log(baz);
update();
console.log(baz);

export { bar, baz, foo, update$1 as updateBar, update as updateBaz, update$2 as updateFoo };
