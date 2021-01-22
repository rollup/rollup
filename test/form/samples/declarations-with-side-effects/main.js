let foo1 = true, bar1 = globalFunction(), baz1 = true;
bar1 = 'somethingElse';
console.log(foo1);

const foo2 = 1, bar2 = {[globalFunction()]: globalFunction()}, baz2 = 3;
console.log(baz2);

const foo3 = globalFunction();
