/*@__PURE__*/
(() => {})();
console.log('should remain impure');

console.log('code');//@__PURE__
(() => {})();
console.log('should remain impure');

console.log('code')/*@__PURE__*/;
(() => {})();
console.log('should remain impure');

(() => {})();//@__PURE__
(() => {})();
console.log('should remain impure');

console.log('code');/*@__PURE__*///@__PURE__
/*@__PURE__*/ (() => {})();
console.log('should remain impure');

console.log('code'),//@__PURE__
(() => {})(),console.log('should remain impure');

console.log('code')/*@__PURE__*/,
(() => {})(),console.log('should remain impure');

(() => {})(),//@__PURE__
(() => {})(),console.log('should remain impure');

console.log('code');//@__PURE__
;console.log('should remain impure');

/*@__PURE__*/true && console.log('should remain impure');

/*@__PURE__*/true ? console.log('should remain impure') : console.log('code');

console.log('code');//@__PURE__
import code from './dep.js';
console.log('should remain impure', code);

/*@__PURE__*/
if (true) {
	console.log('should remain impure');
}

/*@__PURE__*/ drop1();
/*@__PURE__*/
drop2();
keep1() /*@__PURE__*/ ; keep2();
keep3() ; /*@__PURE__*/
drop3();
keep4() /*@__PURE__*/ ; /* other comment */ keep5();
keep6() /*@__PURE__*/ ; // other comment
keep7();
keep8() /*@__PURE__*/ && keep9();

/*@__PURE__*/ Drop1(), // FIXME: unrelated issue
/*@__PURE__*/
Drop2(),
Keep1() /*@__PURE__*/ , Keep2(),
Keep3() , /*@__PURE__*/
Drop3(),
Keep4() /*@__PURE__*/ , /* other comment */ Keep5(),
Keep6() /*@__PURE__*/ , // other comment
Keep7(),
Keep8() /*@__PURE__*/ && Keep9();

// FIXME: unrelated issue
/*@__PURE__*/ Drop10(),
/*@__PURE__*/ Drop11(),
/*@__PURE__*/ Drop12(),
/*@__PURE__*/ Drop13();
