'ab'.replace( 'a', () => console.log( 1 ) || 'b' );

// deep property access is forbidden
true.x.y;
(1).x.y;
'ab'.x.y;

// due to strict mode, extension is forbidden
true.x = 1;
(1).x = 1;
'ab'.x = 1;
