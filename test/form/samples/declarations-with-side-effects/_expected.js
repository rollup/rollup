let foo1 = true; globalFunction();
console.log(foo1);

({[globalFunction()]: globalFunction()}); const baz2 = 3;
console.log(baz2);

globalFunction();
