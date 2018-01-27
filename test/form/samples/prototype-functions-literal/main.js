const boolean = true;
const valueOf1 = boolean.valueOf();
const valueOf2 = true.valueOf();
const valueOf3 = true.valueOf().valueOf();
const valueOf4 = true.valueOf().valueOf().valueOf();

const number = 1;
const toExponential1 = number.toExponential( 2 );
const toExponential2 = (1).toExponential( 2 );
const toExponential3 = (1).toExponential( 2 ).trim();

const string = ' b ';
const trim1 = string.trim();
const trim2 = ' x '.trim();
const trim3 = ' x '.trim().trim();
const trim4 = ' x '.trim().trim().trim();

// boolean prototype
const _booleanToString = true.toString().trim();
const _booleanValueOf = true.valueOf().toString();

// number prototype
const _toExponential = (1).toExponential( 2 ).trim();
const _toFixed = (1).toFixed( 2 ).trim();
const _toLocaleString = (1).toLocaleString().trim();
const _toPrecision = (1).toPrecision( 2 ).trim();
const _numberToString = (1).toString().trim();
const _numberValueOf = (1).valueOf().toExponential( 2 );

// string prototype
const _charAt = 'ab'.charAt( 1 ).trim();
const _charCodeAt = 'ab'.charCodeAt( 1 ).toExponential( 2 );
const _codePointAt = 'ab'.codePointAt( 1 ).toExponential( 2 );
const _concat = 'ab'.concat( 'c' ).trim();
const _includes = 'ab'.includes( 'a' ).valueOf();
const _endsWith = 'ab'.endsWith( 'a' ).valueOf();
const _indexOf = 'ab'.indexOf( 'a' ).toExponential( 2 );
const _lastIndexOf = 'ab'.lastIndexOf( 'a' ).toExponential( 2 );
const _localeCompare = 'ab'.localeCompare( 'a' ).toExponential( 2 );
const _match = 'ab'.match( /a/ ).valueOf();
const _normalize = 'ab'.normalize().trim();
const _padEnd = 'ab'.padEnd( 4, 'a' ).trim();
const _padStart = 'ab'.padStart( 4, 'a' ).trim();
const _repeat = 'ab'.repeat( 2 ).trim();
// _replace not added yet as it can call one of its arguments
const _search = 'ab'.search( /a/ ).toExponential( 2 );
const _slice = 'ab'.slice( 0, 1 ).trim();
const _split = 'ab'.split( 'a' ).join();
const _startsWith = 'ab'.startsWith( 'a' ).valueOf();
const _substr = 'ab'.substr( 0, 1 ).trim();
const _substring = 'ab'.substring( 0, 1 ).trim();
const _toLocaleLowerCase = 'ab'.toLocaleLowerCase().trim();
const _toLocaleUpperCase = 'ab'.toLocaleUpperCase().trim();
const _toLowerCase = 'ab'.toLowerCase().trim();
const _stringToString = 'ab'.toString().trim();
const _toUpperCase = 'ab'.toUpperCase().trim();
const _trim = 'ab'.trim().trim();
const _stringValueOf = 'ab'.valueOf().trim();

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
