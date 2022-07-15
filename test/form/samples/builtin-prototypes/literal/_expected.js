// retained
true.valueOf()();
true.valueOf()[globalThis.unknown]();
true.valueOf().unknown();
true.valueOf().unknown.unknown();
true.valueOf().unknown.unknown().unknown;

(1).valueOf()();
(1).valueOf()[globalThis.unknown]();
(1).valueOf().unknown();
(1).valueOf().unknown.unknown();
(1).valueOf().unknown.unknown().unknown;

'ab'.charAt(1)();
'ab'.charAt(1)[globalThis.unknown]();
'ab'.charAt(1).unknown();
'ab'.charAt(1).unknown.unknown();
'ab'.charAt(1).unknown.unknown().unknown;

null.unknown;
'ab'.replace('a', () => console.log(1) || 'b');
'ab'.replaceAll('a', () => console.log(1) || 'b');

// deep property access is forbidden
true.x.y;
(1).x.y;
'ab'.x.y;

// due to strict mode, extension is forbidden
true.x = 1;
(1).x = 1;
'ab'.x = 1;
