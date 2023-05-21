new Set([f()]); //retained

new Set(['a']);

new Set();

new WeakSet([f()]); //retained

new WeakSet([{}]);

new WeakSet();

new Map([['a', f()]]); //retained

new Map([['a', 'a']]);

new Map();

new WeakMap([[f(), 'a']]); //retained

new WeakMap([[{}, 'a']]);

new WeakMap();
