First side effect in dep-mapped.js is at (2:26)
1: const removed = true;
2: const alsoRemoved = true; console.log('mapped effect');
                             ^
Original location is at (1:0)
1: console.log('mapped effect');
   ^


First side effect in dep-long-line.js is at (1:126)
1: /* This side effect is deeply hidden inside a very long line, beyond the 120-character limit that we impose for truncation */ console.lo...
                                                                                                                                 ^

First side effect in main.js is at (3:0)
1: import './dep-mapped';
2: import './dep-long-line';
3: console.log('main effect');
   ^
4: console.log('other effect');

console.log('mapped effect');

/* This side effect is deeply hidden inside a very long line, beyond the 120-character limit that we impose for truncation */ console.log('mapped effect'); /* and there is more on this line */

console.log('main effect');
console.log('other effect');
