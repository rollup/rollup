new Set([f()]); //retained

new WeakSet([f()]); //retained

new Map([['a', f()]]); //retained

new WeakMap([[f(), 'a']]); //retained
