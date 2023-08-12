/*@__PURE__*/
(() => {})();

console.log('code1'); /*@__PURE__*/
(() => {})(), /*@__PURE__*/(() => {})();

console.log('code2'); /*@__PURE__*/
(() => {})() || /*@__PURE__*/(() => {})();

console.log('code3'); /*@__PURE__*/
(() => {})() + /*@__PURE__*/(() => {})();

console.log('code4'); /*@__PURE__*/
(() => {})() ? /*@__PURE__*/(() => {})() : /*@__PURE__*/(() => {})();

console.log('code5'); /*@__PURE__*/
foo?.bar();

console.log('code6');//@__PURE__
(() => {})();

console.log('code7')/*@__PURE__*/;
(() => {})();

console.log('code8');
(() => {})();//@__PURE__
(() => {})();

console.log('code9');/*@__PURE__*///@__PURE__
/*@__PURE__*/ (() => {})();

console.log('code10'),//@__PURE__
(() => {})(),console.log('code11');

console.log('code12')/*@__PURE__*/,
(() => {})(),console.log('code13');

(() => {})(),//@__PURE__
(() => {})(),console.log('code14');

console.log('code15');//@__PURE__
;console.log('code16');

/*@__PURE__*/true && console.log('code17');

/*@__PURE__*/true ? console.log('code18') : console.log('removed');

console.log('code19');//@__PURE__
import code from './dep.js';
console.log('code20', code);

/*@__PURE__*/
if (true) {
	console.log('code21');
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

/*@__PURE__*/ Drop1(),
/*@__PURE__*/
Drop2(),
Keep1() /*@__PURE__*/ , Keep2(),
Keep3() , /*@__PURE__*/
Drop3(),
Keep4() /*@__PURE__*/ , /* other comment */ Keep5(),
Keep6() /*@__PURE__*/ , // other comment
Keep7(),
Keep8() /*@__PURE__*/ && Keep9();

/*@__PURE__*/ Drop10(),
/*@__PURE__*/ Drop11(),
/*@__PURE__*/ Drop12(),
/*@__PURE__*/ Drop13();
