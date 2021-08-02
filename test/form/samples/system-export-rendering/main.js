// ---
// Single export name
export let foo = 1;

// Assignment
// foo = 2
foo = 2;
console.log(foo = 2);

// foo += 2
foo += 2;
console.log(foo += 2);

// { foo } = obj
({ foo } = obj);
console.log({ foo } = obj);

// Update
// foo++
foo++;
console.log(foo++);
foo--;

// ++foo
++foo;
console.log(++foo);
--foo;

// ---
// Multiple export names
export let bar = 1;
export { bar as bar2 };

// Assignment
// bar = 2
bar = 2;
console.log(bar = 2);

// bar += 2
bar += 2;
console.log(bar += 2);

// { bar } = obj
({ bar } = obj);
console.log({ bar } = obj);

// Update
// bar++
bar++;
console.log(bar++);
bar--;

// ++bar
++bar;
console.log(++bar);
--bar;
