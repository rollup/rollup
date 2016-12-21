import foo from './foo';

// we should not trim this string
var str = '//# sourceMappingURL=main.js.map';

console.log( foo(str) );

//# sourceMappingURL=main.js.map
