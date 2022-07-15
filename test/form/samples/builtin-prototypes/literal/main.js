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

// boolean prototype
true.valueOf();
true.valueOf().valueOf();
true.valueOf().valueOf().valueOf();
const _booleanToString = true.toString().trim();
const _booleanValueOf = true.valueOf().valueOf();

// inherited
const _booleanHasOwnProperty = true.hasOwnProperty('toString').valueOf();
const _booleanIsPrototypeOf = true.isPrototypeOf(true).valueOf();
const _booleanPropertyIsEnumerable = true.propertyIsEnumerable('toString').valueOf();
const _booleanToLocaleString = true.toLocaleString().trim();

// number prototype
(1).valueOf();
(1).valueOf().valueOf();
(1).valueOf().valueOf().valueOf();
const _numberToExponential = (1).toExponential(2).trim();
const _numberToFixed = (1).toFixed(2).trim();
const _numberToLocaleString = (1).toLocaleString().trim();
const _numberToPrecision = (1).toPrecision(2).trim();
const _numberToString = (1).toString().trim();
const _numberValueOf = (1).valueOf().toExponential(2);

// inherited
const _numberHasOwnProperty = (1).hasOwnProperty('toString').valueOf();
const _numberIsPrototypeOf = (1).isPrototypeOf(1).valueOf();
const _numberPropertyIsEnumerable = (1).propertyIsEnumerable('toString').valueOf();

// string prototype
'ab'.valueOf();
'ab'.valueOf().valueOf();
'ab'.valueOf().valueOf().valueOf();
const _stringAt = 'ab'.at(1);
const _stringCharAt = 'ab'.charAt(1).trim();
const _stringCharCodeAt = 'ab'.charCodeAt(1).toExponential(2);
const _stringCodePointAt = 'ab'.codePointAt(1);
const _stringConcat = 'ab'.concat('c').trim();
const _stringEndsWith = 'ab'.endsWith('a').valueOf();
const _stringIncludes = 'ab'.includes('a').valueOf();
const _stringIndexOf = 'ab'.indexOf('a').toExponential(2);
const _stringLastIndexOf = 'ab'.lastIndexOf('a').toExponential(2);
const _stringLocaleCompare = 'ab'.localeCompare('a').toExponential(2);
const _stringMatch = 'ab'.match(/a/);
const _stringMatchAll = 'ab'.matchAll(/a/);
const _stringNormalize = 'ab'.normalize().trim();
const _stringPadEnd = 'ab'.padEnd(4, 'a').trim();
const _stringPadStart = 'ab'.padStart(4, 'a').trim();
const _stringRepeat = 'ab'.repeat(2).trim();
const _stringReplace = 'ab'.replace('a', () => 'b').trim();
const _stringReplaceEffect = 'ab'.replace('a', () => console.log(1) || 'b');
const _stringReplaceAll = 'ab'.replaceAll('a', () => 'b').trim();
const _stringReplaceAllEffect = 'ab'.replaceAll('a', () => console.log(1) || 'b');
const _stringSearch = 'ab'.search(/a/).toExponential(2);
const _stringSlice = 'ab'.slice(0, 1).trim();
const _stringSplit = 'ab'.split('a');
const _stringStartsWith = 'ab'.startsWith('a').valueOf();
const _stringSubstring = 'ab'.substring(0, 1).trim();
const _stringToLocaleLowerCase = 'ab'.toLocaleLowerCase().trim();
const _stringToLocaleUpperCase = 'ab'.toLocaleUpperCase().trim();
const _stringToLowerCase = 'ab'.toLowerCase().trim();
const _stringToString = 'ab'.trim();
const _stringToUpperCase = 'ab'.toUpperCase().trim();
const _stringTrim = 'ab'.trim().trim();
const _stringTrimEnd = 'ab'.trimEnd().trim();
const _stringTrimStart = 'ab'.trimStart().trim();
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
const _stringHasOwnProperty = 'ab'.hasOwnProperty('toString').valueOf();
const _stringIsPrototypeOf = 'ab'.isPrototypeOf('').valueOf();
const _stringPropertyIsEnumerable = 'ab'.propertyIsEnumerable('toString').valueOf();
const _stringToLocaleString = 'ab'.toLocaleString().trim();

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
