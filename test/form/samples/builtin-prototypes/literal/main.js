const boolean = true;
const valueOf1 = boolean.valueOf();
const valueOf2 = true.valueOf();
const valueOf3 = true.valueOf().valueOf();
const valueOf4 = true.valueOf().valueOf().valueOf();

// retained
true.valueOf().unknown.unknown();
true.valueOf()();
(1).valueOf().unknown.unknown();
(1).valueOf().unknown();
(1).valueOf()[globalThis.unknown]();
(1).valueOf()();
'ab'.charAt(1).unknown.unknown();
'ab'.charAt(1)();
null.unknown;

// number prototype
const _toExponential = (1).toExponential( 2 ).trim();
const _toFixed = (1).toFixed( 2 ).trim();
const _toLocaleString = (1).toLocaleString().trim();
const _toPrecision = (1).toPrecision( 2 ).trim();
const _numberValueOf = (1).valueOf().toExponential( 2 );
// inherited
const _numberHasOwnProperty = (1).hasOwnProperty( 'toString' ).valueOf();
const _numberIsPrototypeOf = (1).isPrototypeOf( 1 ).valueOf();
const _numberPropertyIsEnumerable = (1).propertyIsEnumerable( 'toString' ).valueOf();
const _numberToLocaleString = (1).toLocaleString().trim();
const _numberToString = (1).toString().trim();

// string prototype
const _at = 'ab'.at( 1 )
const _charAt = 'ab'.charAt( 1 ).trim();
const _charCodeAt = 'ab'.charCodeAt( 1 ).toExponential( 2 );
const _codePointAt = 'ab'.codePointAt( 1 );
const _concat = 'ab'.concat( 'c' ).trim();
const _includes = 'ab'.includes( 'a' ).valueOf();
const _endsWith = 'ab'.endsWith( 'a' ).valueOf();
const _indexOf = 'ab'.indexOf( 'a' ).toExponential( 2 );
const _lastIndexOf = 'ab'.lastIndexOf( 'a' ).toExponential( 2 );
const _localeCompare = 'ab'.localeCompare( 'a' ).toExponential( 2 );
const _match = 'ab'.match( /a/ )
const _matchAll = 'ab'.matchAll( /a/ )
const _normalize = 'ab'.normalize().trim();
const _padEnd = 'ab'.padEnd( 4, 'a' ).trim();
const _padStart = 'ab'.padStart( 4, 'a' ).trim();
const _repeat = 'ab'.repeat( 2 ).trim();
const _replace = 'ab'.replace( 'a', () => 'b' ).trim();
const _replaceEffect = 'ab'.replace( 'a', () => console.log( 1 ) || 'b' );
const _replaceAll = 'ab'.replaceAll( 'a', () => 'b' ).trim();
const _replaceAllEffect = 'ab'.replaceAll( 'a', () => console.log( 1 ) || 'b' );
const _search = 'ab'.search( /a/ ).toExponential( 2 );
const _slice = 'ab'.slice( 0, 1 ).trim();
const _split = 'ab'.split( 'a' );
const _startsWith = 'ab'.startsWith( 'a' ).valueOf();
const _substring = 'ab'.substring( 0, 1 ).trim();
const _toLocaleLowerCase = 'ab'.toLocaleLowerCase().trim();
const _toLocaleUpperCase = 'ab'.toLocaleUpperCase().trim();
const _toLowerCase = 'ab'.toLowerCase().trim();
const _toString = 'ab'.trim();
const _toUpperCase = 'ab'.toUpperCase().trim();
const _trim = 'ab'.trim().trim();
const _trimEnd = 'ab'.trimEnd().trim();
const _trimStart = 'ab'.trimStart().trim();
const _stringValueOf = 'ab'.valueOf().trim();

// DEPRECATED prototype methods
const _anchor = 'ab'.anchor().trim();
const _big = 'ab'.big().trim();
const _blink = 'ab'.blink().trim();
const _bold = 'ab'.bold().trim();
const _fixed = 'ab'.fixed().trim();
const _fontcolor = 'ab'.fontcolor().trim();
const _fontsize = 'ab'.fontsize().trim();
const _italics = 'ab'.italics().trim();
const _link = 'ab'.link().trim();
const _small = 'ab'.small().trim();
const _strike = 'ab'.strike().trim();
const _sub = 'ab'.sub().trim();
const _substr = 'ab'.substr(0, 1).trim();
const _sup = 'ab'.sup().trim();
const _trimLeft = 'ab'.trimLeft().trim();
const _trimRight = 'ab'.trimRight().trim();

// inherited
const _stringHasOwnProperty = 'ab'.hasOwnProperty( 'toString' ).valueOf();
const _stringIsPrototypeOf = 'ab'.isPrototypeOf( '' ).valueOf();
const _stringPropertyIsEnumerable = 'ab'.propertyIsEnumerable( 'toString' ).valueOf();
const _stringToLocaleString = 'ab'.toLocaleString().trim();
const _stringToString = 'ab'.toString().trim();

// property access is allowed
const accessBoolean = true.x;
const accessNumber = (1).x;
const accessString = 'ab'.x;

// deep property access is forbidden
const deepBoolean = true.x.y;
const deepNumber = (1).x.y;
const deepString = 'ab'.x.y;

// due to strict mode, extension is forbidden
true.x = 1;
(1).x = 1;
'ab'.x = 1;
