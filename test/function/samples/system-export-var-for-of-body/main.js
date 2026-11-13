export var bodyVar;
for (const ignored of [1]) var bodyVar = 3;

export var bodyIn;
for (const key in { a: 1 }) var bodyIn = 4;
